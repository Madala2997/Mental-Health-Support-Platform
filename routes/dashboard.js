const express = require('express');
const Journal = require('../models/Journal');
const Mood = require('../models/Mood');
const Forum = require('../models/Forum');
const Chat = require('../models/Chat');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard data
router.get('/', auth, async (req, res) => {
  try {
    // Get user stats
    const journalCount = await Journal.countDocuments({ author: req.user._id });
    const moodCount = await Mood.countDocuments({ user: req.user._id });
    const forumCount = await Forum.countDocuments({ author: req.user._id });
    const chatCount = await Chat.countDocuments({ 
      participants: req.user._id,
      isActive: true 
    });

    // Get recent journal entries
    const recentJournals = await Journal.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt mood');

    // Get recent mood entries
    const recentMoods = await Mood.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(5)
      .select('mood moodValue date notes');

    // Get recent forum posts
    const recentForumPosts = await Forum.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title category createdAt upvotes');

    // Get today's mood
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysMood = await Mood.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    res.json({
      success: true,
      stats: {
        journalEntries: journalCount,
        moodEntries: moodCount,
        forumPosts: forumCount,
        chatSessions: chatCount
      },
      recentActivity: {
        journals: recentJournals,
        moods: recentMoods.map(mood => ({
          ...mood.toObject(),
          moodLabel: getMoodLabel(mood.mood)
        })),
        forumPosts: recentForumPosts
      },
      todaysMood: todaysMood ? {
        ...todaysMood.toObject(),
        moodLabel: getMoodLabel(todaysMood.mood)
      } : null
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to get mood label
function getMoodLabel(mood) {
  const labels = {
    'very-happy': 'Very Happy',
    'happy': 'Happy',
    'neutral': 'Neutral',
    'sad': 'Sad',
    'very-sad': 'Very Sad'
  };
  return labels[mood] || 'Unknown';
}

module.exports = router;
