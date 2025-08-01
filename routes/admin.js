const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Resource = require('../models/Resource');
const Journal = require('../models/Journal');
const Forum = require('../models/Forum');
const Chat = require('../models/Chat');
const Mood = require('../models/Mood');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCounselors = await User.countDocuments({ role: 'counselor' });
    const totalResources = await Resource.countDocuments();
    const totalJournalEntries = await Journal.countDocuments();
    const totalForumPosts = await Forum.countDocuments();
    const activeChatSessions = await Chat.countDocuments({ isActive: true });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentJournalEntries = await Journal.find({ isVisible: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name role');

    const reportedContent = {
      journals: await Journal.countDocuments({ isReported: true }),
      forums: await Forum.countDocuments({ isReported: true })
    };

    // Mood analytics
    const moodStats = await Mood.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalCounselors,
        totalResources,
        totalJournalEntries,
        totalForumPosts,
        activeChatSessions
      },
      recentActivity: {
        users: recentUsers,
        journalEntries: recentJournalEntries
      },
      reportedContent,
      moodStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with pagination
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, [
  body('role').isIn(['student', 'counselor', 'admin']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify counselor
router.put('/users/:id/verify', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reported content
router.get('/reported', adminAuth, async (req, res) => {
  try {
    const reportedJournals = await Journal.find({ isReported: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    const reportedForums = await Forum.find({ isReported: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      journals: reportedJournals,
      forums: reportedForums
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Moderate journal entry
router.put('/journal/:id/moderate', adminAuth, [
  body('action').isIn(['approve', 'hide', 'delete']).withMessage('Invalid action')
], async (req, res) => {
  try {
    const { action } = req.body;
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    switch (action) {
      case 'approve':
        journal.isReported = false;
        journal.isVisible = true;
        journal.reportCount = 0;
        break;
      case 'hide':
        journal.isVisible = false;
        break;
      case 'delete':
        await Journal.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Journal entry deleted' });
    }

    await journal.save();
    res.json({ message: `Journal entry ${action}d` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Moderate forum post
router.put('/forum/:id/moderate', adminAuth, [
  body('action').isIn(['approve', 'lock', 'pin', 'delete']).withMessage('Invalid action')
], async (req, res) => {
  try {
    const { action } = req.body;
    const post = await Forum.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Forum post not found' });
    }

    switch (action) {
      case 'approve':
        post.isReported = false;
        post.reportCount = 0;
        break;
      case 'lock':
        post.isLocked = true;
        break;
      case 'pin':
        post.isPinned = true;
        break;
      case 'delete':
        await Forum.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Forum post deleted' });
    }

    await post.save();
    res.json({ message: `Forum post ${action}d` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get resource management
router.get('/resources', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, published } = req.query;
    const query = {};

    if (published !== undefined) {
      query.isPublished = published === 'true';
    }

    const resources = await Resource.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Resource.countDocuments(query);

    res.json({
      resources,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update resource status
router.put('/resources/:id/status', adminAuth, [
  body('isPublished').isBoolean().withMessage('Published status must be boolean')
], async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { isPublished: req.body.isPublished },
      { new: true }
    ).populate('author', 'name email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
