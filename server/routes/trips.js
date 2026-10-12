const express = require('express');
const router = express.Router();
const Trip = require('../models/spot'); // will import Trip and Spot
const TripModel = require('../models/trip');
const { generateTeslaTripPlan, getAiClient } = require('../services/aiPlanner');
const { dailyPlanRateLimiter } = require('../middleware/rateLimiter');

// POST /api/plan - Generate an AI trip plan and save it
router.post('/plan', dailyPlanRateLimiter, async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Please provide a trip description or destination prompt.'
      });
    }

    // Check if AI is configured before attempting call
    if (!getAiClient()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'AI API key is not configured on the server. You can still use the offline fallback planner or configure AI_API_KEY on Render / .env.'
      });
    }

    const itinerary = await generateTeslaTripPlan(prompt.trim());

    // Save trip to database
    const trip = new TripModel({
      prompt: prompt.trim(),
      itinerary: itinerary
    });
    await trip.save();

    res.status(201).json(trip);
  } catch (err) {
    if (err.code === 'AI_NOT_CONFIGURED' || err.message === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'AI API key is not configured on the server. Please set AI_API_KEY in server environment or use the offline fallback planner.'
      });
    }
    console.error('Trip planning error:', err.message);
    res.status(500).json({
      error: 'PLANNING_FAILED',
      message: err.message || 'Failed to generate itinerary. Please try again.'
    });
  }
});

// GET /api/trips - List saved trips
router.get('/trips', async (req, res, next) => {
  try {
    const trips = await TripModel.find().sort({ createdAt: -1 }).limit(50);
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id - Retrieve specific trip
router.get('/trips/:id', async (req, res, next) => {
  try {
    const trip = await TripModel.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Trip itinerary not found.' });
    }
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/trips/:id - Delete a trip
router.delete('/trips/:id', async (req, res, next) => {
  try {
    const deleted = await TripModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Trip itinerary not found.' });
    }
    res.json({ success: true, message: 'Trip deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/trips - Save an itinerary manually (e.g. from offline planner)
router.post('/trips', async (req, res, next) => {
  try {
    const { prompt, itinerary } = req.body;
    if (!prompt || !itinerary) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'Prompt and itinerary are required.' });
    }
    const trip = new TripModel({
      prompt: String(prompt).trim(),
      itinerary: itinerary
    });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
