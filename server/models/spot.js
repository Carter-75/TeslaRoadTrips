const mongoose = require('mongoose');

/**
 * Bulk Import JSON Format Documentation:
 * 
 * To bulk-import verified or community spots into MongoDB, format your JSON file as an array of objects:
 * [
 *   {
 *     "name": "Cracker Barrel #482",
 *     "state": "UT",
 *     "city": "St. George",
 *     "lat": 37.0792,
 *     "lng": -113.5841,
 *     "notes": "Designated RV/camper spaces in rear. Speak with night manager upon arrival. 1.2 miles to 250 kW Supercharger.",
 *     "verificationLevel": "verified",
 *     "source": "Tesla Community Verified 2026"
 *   }
 * ]
 *
 * You can load this directly via `mongoimport --uri "<MONGODB_URI>" --collection spots --file spots.json --jsonArray`
 * or by calling the bulk seed script.
 */

const SpotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 2
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    verificationLevel: {
      type: String,
      enum: ['verified', 'unverified', 'pending'],
      default: 'unverified'
    },
    source: {
      type: String,
      default: 'Community Submission',
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

SpotSchema.index({ name: 'text', city: 'text', notes: 'text' });
SpotSchema.index({ state: 1 });

module.exports = mongoose.model('Spot', SpotSchema);
