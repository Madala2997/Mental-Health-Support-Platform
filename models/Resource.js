const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['article', 'video', 'guide', 'exercise'],
    required: true
  },
  category: {
    type: String,
    enum: ['stress-management', 'anxiety', 'motivation', 'depression', 'self-care', 'mindfulness', 'academic-pressure'],
    required: true
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mediaUrl: String, // For videos or images
  readTime: Number, // Estimated read time in minutes
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
resourceSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
