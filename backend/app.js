// --- Environment and Dependencies ---
const path = require('path');
const fs = require('fs');

if (!process.env.VERCEL) {
  try {
    const dns = require('node:dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

const resolveEnvPath = () => {
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'), 
    path.join(process.cwd(), 'backend', '.env.local'),
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];
  for (const c of candidates) { if (fs.existsSync(c)) return c; }
  return null;
};
const envPath = resolveEnvPath();
if (envPath) require('dotenv').config({ path: envPath });
else require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const passport = require('passport');

const app = express();

// --- Configuration ---
const isProd = process.env.PRODUCTION === 'true' || process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
const PROJECT_NAME = process.env.PROJECT_NAME || 'TeslaCampPlanner';

// Trust proxy for secure cookies and IP forwarding on Render / Vercel
app.set('trust proxy', 1);

// --- Models & Passport Config ---
require('./config/passport')(passport);

// --- Routers ---
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const tripsRouter = require('./routes/trips');
const spotsRouter = require('./routes/spots');

// --- MongoDB Setup ---
const mongoURI = process.env.MONGODB_URI;
let lastDbError = null;
let dbConnectPromise = null;

mongoose.connection.on('error', (err) => {
  lastDbError = err.message;
  console.warn('WARN: MongoDB connection error:', err.message);
});

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2 && dbConnectPromise) {
    try {
      await dbConnectPromise;
    } catch (e) {}
    return;
  }
  
  if (!mongoURI) {
    lastDbError = 'No MONGODB_URI found in environment!';
    console.warn('WARN: ' + lastDbError);
    return;
  }

  try {
    console.log('INFO: Connecting to MongoDB...');
    dbConnectPromise = mongoose.connect(mongoURI, {
      dbName: process.env.PROJECT_NAME || 'teslaroadtrips',
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000
    });
    await dbConnectPromise;
    console.log('OK: Connected to MongoDB');
    lastDbError = null;
  } catch (err) {
    lastDbError = err.message;
    console.error('ERROR: MongoDB Connection Failed:', err.message);
  } finally {
    dbConnectPromise = null;
  }
};

// Initial connection
connectDB().catch(() => {});

// --- Diagnostic Route (GET /api/health) ---
app.get('/api/health', async (req, res) => {
  if (mongoose.connection.readyState !== 1 && mongoURI) {
    await connectDB();
  }
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    status: 'ok',
    ok: true,
    timestamp: new Date().toISOString(),
    database: states[mongoose.connection.readyState] || 'Unknown',
    readyState: mongoose.connection.readyState,
    env: isProd ? 'production' : 'development',
    hasMongoUri: !!mongoURI
  });
});

// --- Middlewares ---

// Wait for DB middleware for /api routes that need the database
const dbCheck = async (req, res, next) => {
  if (!mongoURI) {
    // If no mongoURI is configured, let it through so offline fallback / non-db routes or mocks can function
    return next();
  }
  if (mongoose.connection.readyState === 1) return next();
  if (mongoose.connection.readyState === 0) await connectDB();
  
  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (mongoose.connection.readyState === 1) {
      clearInterval(interval);
      return next();
    }
    if (attempts >= 25) {
      clearInterval(interval);
      return res.status(503).json({ 
        error: 'DATABASE_TIMEOUT',
        message: 'Database connection timeout. Please refresh or check MONGODB_URI.' 
      });
    }
  }, 100);
};

app.use(helmet({
  frameguard: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  // In production the frontend and API share one domain, so no CORS is needed.
  // Set CORS_ORIGIN if the frontend ever lives on a different domain.
  origin: isProd ? (process.env.CORS_ORIGIN || false) : true,
  credentials: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Sessions
// No publicly-known fallback: without SESSION_SECRET we generate an ephemeral
// random secret so the app still boots (sessions just won't survive restarts).
// Set SESSION_SECRET in env vars for persistent production sessions.
const crypto = require('crypto');
let sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.warn('WARN: SESSION_SECRET not set; using an ephemeral random secret. Set SESSION_SECRET in production env vars for persistent sessions.');
  sessionSecret = 'ephemeral-' + crypto.randomBytes(32).toString('hex');
}
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: mongoURI ? MongoStore.create({
      mongoUrl: mongoURI,
      dbName: process.env.PROJECT_NAME || 'teslaroadtrips',
      touchAfter: 24 * 3600
    }) : undefined,
    cookie: {
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    }
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Apply DB check to /api data routes
app.use('/api', dbCheck);

// API Route Mounts
app.use('/api', tripsRouter);
app.use('/api', spotsRouter);
app.use('/api', indexRouter);
app.use('/api/auth', authRouter);

// Serve Static Angular Frontend (for Render and production)
const frontendDistCandidates = [
  path.resolve(__dirname, '../frontend/dist/frontend'),
  path.resolve(__dirname, '../../frontend/dist/frontend'),
  path.resolve(process.cwd(), 'frontend/dist/frontend'),
  path.resolve(process.cwd(), 'client/dist/frontend')
];

let activeDistPath = null;
for (const cand of frontendDistCandidates) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    activeDistPath = cand;
    break;
  }
}

if (activeDistPath) {
  console.log(`INFO: Serving frontend static build from ${activeDistPath}`);
  app.use(express.static(activeDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
      return next();
    }
    res.sendFile(path.join(activeDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      name: 'Tesla Camp Planner API',
      status: 'online',
      message: 'API is running. Build frontend with `npm run build` to enable web UI serving.'
    });
  });
}

// Central Error Handler: never leak secrets or raw internal stack traces
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.code || 'SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
});

module.exports = app;
