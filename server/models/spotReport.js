const mongoose = require('mongoose');

const SpotReportSchema = new mongoose.Schema(
  {
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Spot',
      required: true
    },
    type: {
      type: String,
      enum: ['problem', 'praise'],
      required: true
    },
    note: {
      type: String,
      required: true,
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

module.exports = mongoose.model('SpotReport', SpotReportSchema);
