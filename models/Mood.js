const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    enum: ['very-sad', 'sad', 'neutral', 'happy', 'very-happy'],
    required: true
  },
  moodValue: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  factors: [{
    type: String,
    enum: ['sleep', 'exercise', 'social', 'academic', 'family', 'health', 'weather', 'other']
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one mood entry per user per day
moodSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Mood', moodSchema);
