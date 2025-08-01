const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'academic-stress', 'relationships', 'anxiety', 'depression', 'self-care', 'motivation'],
    required: true
  },
  tags: [String],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      maxlength: 2000
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
forumSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Forum', forumSchema);
