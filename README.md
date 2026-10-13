# Tesla Camp Planner

Tesla Camp Planner is a production-ready MEAN stack web app and native mobile application designed specifically for electric vehicle road-trippers and car campers. It combines AI-powered route planning, curated free overnight parking spots (BLM dispersed lands, select Walmarts, Cracker Barrels, Cabela's), daily shower finders, and Tesla Camp Mode battery buffer guidance.

---

## Architecture in Words

The application operates as a unified, decoupled MEAN stack system:

1. **Frontend Client (`frontend/`)**:
   - Built with Angular v21 using standalone components and reactive Signals.
   - Tailored mobile-first user experience with a 5-tab bottom navigation bar (Plan, My Trips, Spots, Guides, Budget).
   - Wrapped with **Capacitor** (`@capacitor/core`, `@capacitor/cli`) to compile and package directly as native iOS and Android apps with full splash screen and dark status bar integration.
   - PWA configured with service worker caching the application shell for offline use, web manifest, and custom app icons.
   - Includes an intelligent Offline Fallback Planner that assembles starter itineraries client-side using embedded spot data if the server AI API key is not configured.

2. **Backend Server (`backend/`)**:
   - Node.js and Express REST API mounted under `/api/*`.
   - In production (Render), Express serves the static Angular production bundle (`frontend/dist/frontend`) for all client-side routes, providing a single-service deployment footprint.
   - Connects to MongoDB Atlas via Mongoose models (`Trip`, `Spot`, `SpotReport`).
   - Rate limiting middleware restricts AI planning calls (`POST /api/plan`) to `DAILY_PLAN_LIMIT` per IP address per day to control API costs.
   - AI service invokes OpenAI-compatible endpoints with an extensive Tesla-camping expert prompt, strictly validating battery buffers (45-55% SoC arrival buffer), daily showers, and cost breakdowns.
   - Central error handling returns clean JSON responses without ever leaking server secrets or stack traces.

3. **Database (MongoDB Atlas)**:
   - Houses user-generated itineraries, crowdsourced parking spots, and verification feedback.
   - Auto-seeds 10 realistic unverified free overnight parking spots across the United States upon initial startup.

---

## Local Development Instructions

### Prerequisites
- Node.js v18 or higher (v20+ recommended)
- npm v9 or higher
- Optional: MongoDB running locally or a MongoDB Atlas connection URI

### 1. Clone & Install Dependencies
From the project root:
```bash
npm install
```
The post-install script will automatically install dependencies in both `backend/` and `frontend/`.

### 2. Configure Local Environment
Create or edit `.env.local` in the project root:
```env
PORT=3000
FRONTEND_PORT=4200
MONGODB_URI=mongodb://localhost:27017/teslaroadtrips
AI_API_KEY=your_openai_or_groq_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
DAILY_PLAN_LIMIT=20
```

### 3. Launch Development Server
```bash
npm run dev
```
This starts both the Express backend and the Angular dev server concurrently:
- Backend API: `http://localhost:3000`
- Frontend UI: `http://localhost:4200` (automatically proxies `/api` to port 3000)

---

## MongoDB Atlas Free Cluster Setup (5 Steps)

1. **Create an Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. **Deploy Free Shared Cluster**: Click "Build a Database", select the **M0 Shared Free Tier**, choose your closest cloud provider region (e.g., AWS us-east-1), and click "Create".
3. **Configure Database User**: Under "Security" &gt; "Database Access", create a database user with username/password authentication (choose built-in role: `readWriteAnyDatabase`).
4. **Allow Network Access**: Under "Security" &gt; "Network Access", click "Add IP Address" and select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render and your local environment can connect.
5. **Copy Connection String**: Click "Databases" &gt; "Connect" &gt; "Drivers". Copy the SRV URI string. Replace `<username>` and `<password>` with your credentials:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/teslaroadtrips?retryWrites=true&w=majority
   ```
   Paste this URI into your `MONGODB_URI` environment variable.

---

## Render Deployment via Blueprint

This repository includes a pre-configured `render.yaml` Blueprint that deploys both the Express backend and the built Angular frontend in a single Web Service.

1. Push your repository to GitHub or GitLab.
2. Log into your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** &gt; **Blueprint**.
4. Connect your repository and select the branch (e.g., `main`). Render will automatically detect `render.yaml`.
5. Enter your secret environment variables when prompted:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `AI_API_KEY`: Your OpenAI, Groq, or DeepSeek API key (optional: if omitted, the app gracefully switches to the offline fallback planner).
6. Click **Apply**. Render will install dependencies, compile the Angular app, and boot the Express service.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | No | `3000` | Port for Express HTTP server |
| `MONGODB_URI` | Yes | - | MongoDB connection string (Atlas or local) |
| `AI_API_KEY` | Optional | - | API key for OpenAI, Groq, OpenRouter, or DeepSeek |
| `AI_BASE_URL` | No | `https://api.openai.com/v1` | Custom endpoint for OpenAI-compatible LLM providers |
| `AI_MODEL` | No | `gpt-4o-mini` | Model name passed to chat completions endpoint |
| `DAILY_PLAN_LIMIT` | No | `20` | Max trip generation requests per IP address per calendar day |
| `SESSION_SECRET` | No | Random | Express session encryption secret |
| `NODE_ENV` | No | `development` | Set to `production` when deployed |
| `PRODUCTION` | No | `false` | Enable production static file serving and secure cookies |

---

## Running Capacitor Native Mobile Builds (iOS & Android)

The Angular frontend is packaged with Capacitor, enabling true native compilation for iPhones, iPads, and Android devices.

### 1. Build the Angular Application
Before syncing with native platforms, build the web assets:
```bash
npm run build:client
```
The compiled output is saved to `frontend/dist/frontend`.

### 2. Sync Web Assets with Native Projects
Run from the root directory or inside `frontend/`:
```bash
npm run cap:sync
```
*(Or inside `frontend/`: `npx cap sync`)*

### 3. Open in Xcode (iOS)
*(Requires macOS with Xcode installed)*
```bash
npm run cap:ios
```
*(Or inside `frontend/`: `npx cap open ios`)*
- In Xcode, select your development team under "Signing & Capabilities".
- Choose your physical iPhone or iOS Simulator and press **Run (Cmd+R)**.

### 4. Open in Android Studio (Android)
*(Requires Android Studio with Android SDK installed)*
```bash
npm run cap:android
```
*(Or inside `frontend/`: `npx cap open android`)*
- Allow Android Studio to complete Gradle sync.
- Click **Run 'app' (Shift+F10)** on your emulator or connected device.

---

## Bulk-Importing Verified Spots

You can load real verified spots into MongoDB at any time.

### JSON Data Format
Create a JSON file (e.g., `verified_spots.json`) structured as an array of objects:
```json
[
  {
    "name": "Cracker Barrel Old Country Store #482",
    "state": "UT",
    "city": "St. George",
    "lat": 37.0792,
    "lng": -113.5841,
    "notes": "Designated rear RV/van parking spaces. Courtesy check-in with evening manager appreciated. 1.2 miles to St. George 250 kW Supercharger.",
    "verificationLevel": "verified",
    "source": "Tesla Road Trippers Community 2026"
  },
  {
    "name": "BLM Indian Cove Dispersed Area",
    "state": "CA",
    "city": "Twentynine Palms",
    "lat": 34.0863,
    "lng": -116.1662,
    "notes": "Public BLM dispersed camping north of Joshua Tree boundary. Unmatched stargazing through the glass roof. Arrive with 50%+ battery for overnight HVAC. 8 miles from Supercharger.",
    "verificationLevel": "verified",
    "source": "BLM Bishop Field Office"
  }
]
```

### Import Option A: Using mongoimport CLI
```bash
mongoimport --uri "YOUR_MONGODB_URI" --collection spots --file verified_spots.json --jsonArray
```

### Import Option B: Using Node.js Script
```javascript
const fs = require('fs');
const mongoose = require('mongoose');
const Spot = require('./backend/models/spot');

async function importSpots() {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = JSON.parse(fs.readFileSync('verified_spots.json', 'utf8'));
  const result = await Spot.insertMany(data);
  console.log(`Imported ${result.length} spots.`);
  process.exit(0);
}
importSpots();
```

---

## Quality Checklist

- **Mobile-First Responsive**: Zero horizontal overflow at 390px (iPhone viewport).
- **Graceful Offline Planner**: Full client-side trip generation if server AI is not yet configured.
- **Strict Copy Rule**: Plain friendly language with no em dashes anywhere in user-facing copy.
- **Security**: Zero secrets in client-side code; central error handling prevents credential leakage.
- **Build Verified**: Clean builds for both server and client.
