/**
 * In-memory sliding/daily rate limiter to prevent excessive AI spend.
 * Limits POST /api/plan requests per IP address per calendar day (UTC).
 */

const requestCounts = new Map();

function cleanOldEntries(todayKey) {
  for (const [key] of requestCounts.entries()) {
    if (!key.startsWith(todayKey)) {
      requestCounts.delete(key);
    }
  }
}

function dailyPlanRateLimiter(req, res, next) {
  const limit = parseInt(process.env.DAILY_PLAN_LIMIT || '20', 10);
  
  // Extract client IP (respecting proxy headers)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0].trim() : (req.socket.remoteAddress || '127.0.0.1');
  
  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const trackerKey = `${todayKey}:${ip}`;

  // Periodic cleanup
  if (Math.random() < 0.05) {
    cleanOldEntries(todayKey);
  }

  const currentCount = requestCounts.get(trackerKey) || 0;

  if (currentCount >= limit) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Daily planning limit reached (${limit} plans per day per user). Please try again tomorrow or use the offline planner.`,
      limit,
      remaining: 0
    });
  }

  requestCounts.set(trackerKey, currentCount + 1);
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - (currentCount + 1)));

  next();
}

module.exports = {
  dailyPlanRateLimiter
};
