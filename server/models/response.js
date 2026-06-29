const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  status: {
    type: String,
    enum: ['Playing', 'Not Coming', 'No Response'],
    default: 'No Response'
  }
}, {
  timestamps: true
});

// Ensure a user can only have one response per match
responseSchema.index({ userId: 1, matchId: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
