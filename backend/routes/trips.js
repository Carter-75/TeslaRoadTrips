const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const TripModel = require('../models/trip');
const { chatWithTeslaPlanner, getAiClient } = require('../services/aiPlanner');
const { dailyPlanRateLimiter } = require('../middleware/rateLimiter');

// POST /api/plan or /api/chat: Conversational AI Road Trip Planner
router.post(['/plan', '/chat'], dailyPlanRateLimiter, async (req, res, next) => {
  try {
    const { prompt, history, messages } = req.body;

    let messageList = [];
    if (Array.isArray(messages) && messages.length > 0) {
      messageList = messages;
    } else if (prompt && typeof prompt === 'string') {
      const pastHistory = Array.isArray(history) ? history : [];
      messageList = [...pastHistory, { role: 'user', content: prompt.trim() }];
    } else {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Please provide a message or prompt.'
      });
    }

    // Check if AI is configured before attempting call
    if (!getAiClient()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'AI API key is not configured on the server. You can still use the offline fallback planner or configure AI_API_KEY in your server environment / Render dashboard.'
      });
    }

    const aiResult = await chatWithTeslaPlanner(messageList);

    // If a full itinerary was generated and MongoDB is available, optionally save a Trip record
    let savedTripId = null;
    if (aiResult.type === 'itinerary' && aiResult.itinerary) {
      try {
        const lastUserPrompt = messageList.filter(m => m.role === 'user').pop()?.content || 'Tesla Road Trip';
        const trip = new TripModel({
          prompt: lastUserPrompt,
          itinerary: aiResult.itinerary
        });
        await trip.save();
        savedTripId = trip._id;
      } catch (dbErr) {
        console.warn('Could not auto-save trip to database (running in offline/mock DB mode):', dbErr.message);
      }
    }

    res.status(200).json({
      ...aiResult,
      savedTripId
    });
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
      message: err.message || 'Failed to communicate with AI planner. Please try again.'
    });
  }
});

// GET /api/trips: List saved trips
router.get('/trips', async (req, res, next) => {
  try {
    // Graceful degradation: no DB yet means no trips, not an error
    if (mongoose.connection.readyState !== 1) return res.json([]);
    const trips = await TripModel.find().sort({ createdAt: -1 }).limit(50);
    res.json(trips);
  } catch (err) {
    next(err);
  }
});

// GET /api/trips/:id: Retrieve specific trip
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

// DELETE /api/trips/:id: Delete a trip
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

// POST /api/trips: Save an itinerary manually (e.g. from offline planner)
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
