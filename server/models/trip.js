const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    itinerary: {
      days: [
        {
          day: { type: Number, required: true },
          title: { type: String, required: true },
          routeSummary: { type: String, default: '' },
          overnightSpot: { type: String, default: '' },
          shower: { type: String, default: '' },
          foodPlan: { type: String, default: '' },
          chargingPlan: { type: String, default: '' },
          costs: { type: mongoose.Schema.Types.Mixed, default: 0 }
        }
      ],
      totalEstimatedCost: { type: mongoose.Schema.Types.Mixed, default: 0 },
      overview: { type: String, default: '' },
      climateTips: { type: String, default: '' }
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

module.exports = mongoose.model('Trip', TripSchema);
