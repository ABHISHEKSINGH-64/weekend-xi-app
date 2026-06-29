const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Match date is required']
  },
  time: {
    type: String,
    required: [true, 'Match time is required']
  },
  ground: {
    type: String,
    required: [true, 'Ground location is required']
  },
  announcement: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
