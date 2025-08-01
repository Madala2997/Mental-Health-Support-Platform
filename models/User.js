const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google auth
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  role: {
    type: String,
    enum: ['student', 'counselor', 'admin'],
    default: 'student'
  },
  profile: {
    avatar: String,
    bio: String,
    year: String,
    department: String,
    interests: [String]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    anonymousMode: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'mood-based'],
      default: 'light'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
