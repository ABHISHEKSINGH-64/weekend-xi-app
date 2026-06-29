const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
