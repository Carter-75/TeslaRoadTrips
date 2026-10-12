const express = require('express');
const router = express.Router();
const Spot = require('../models/spot');
const SpotReport = require('../models/spotReport');

// GET /api/spots - Query spots with state and text search
router.get('/spots', async (req, res, next) => {
  try {
    const { state, q } = req.query;
    const filter = {};

    if (state && typeof state === 'string' && state.trim().length > 0) {
      filter.state = state.trim().toUpperCase();
    }

    if (q && typeof q === 'string' && q.trim().length > 0) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { city: searchRegex },
        { notes: searchRegex }
      ];
    }

    const spots = await Spot.find(filter).sort({ verificationLevel: 1, name: 1 });
    res.json(spots);
  } catch (err) {
    next(err);
  }
});

// GET /api/spots/:id - Get a single spot
router.get('/spots/:id', async (req, res, next) => {
  try {
    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Spot not found.' });
    }
    res.json(spot);
  } catch (err) {
    next(err);
  }
});

// POST /api/spots - Crowdsource submission (always created as 'pending')
router.post('/spots', async (req, res, next) => {
  try {
    const { name, state, city, lat, lng, notes, source } = req.body;

    if (!name || !state || !city || lat === undefined || lng === undefined) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Name, 2-letter state, city, latitude, and longitude are required.'
      });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({
        error: 'INVALID_COORDINATES',
        message: 'Latitude and longitude must be valid numbers.'
      });
    }

    const spot = new Spot({
      name: String(name).trim(),
      state: String(state).trim().toUpperCase().slice(0, 2),
      city: String(city).trim(),
      lat: parsedLat,
      lng: parsedLng,
      notes: notes ? String(notes).trim() : '',
      verificationLevel: 'pending',
      source: source ? String(source).trim() : 'Community Submission'
    });

    await spot.save();
    res.status(201).json(spot);
  } catch (err) {
    next(err);
  }
});

// POST /api/spots/:id/report - Report problem or praise
router.post('/spots/:id/report', async (req, res, next) => {
  try {
    const { type, note } = req.body;

    if (!type || !['problem', 'praise'].includes(type)) {
      return res.status(400).json({
        error: 'INVALID_TYPE',
        message: 'Report type must be either "problem" or "praise".'
      });
    }

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_NOTE',
        message: 'Please provide a note describing your feedback.'
      });
    }

    const spot = await Spot.findById(req.params.id);
    if (!spot) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Spot not found.'
      });
    }

    const report = new SpotReport({
      spotId: spot._id,
      type: type,
      note: note.trim()
    });

    await report.save();
    res.status(201).json({
      success: true,
      message: 'Thank you for your report! Your feedback helps the Tesla camping community.',
      report
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
