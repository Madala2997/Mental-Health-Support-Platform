const express = require('express');
const { body, validationResult } = require('express-validator');
const Mood = require('../models/Mood');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's mood history
router.get('/', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await Mood.find({
      user: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json(moods);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get mood analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moods = await Mood.find({
      user: req.user._id,
      date: { $gte: startDate }
    });

    // Calculate analytics
    const totalEntries = moods.length;
    const averageMood = totalEntries > 0 
      ? moods.reduce((sum, mood) => sum + mood.moodValue, 0) / totalEntries 
      : 0;

    const moodDistribution = {
      'very-sad': 0,
      'sad': 0,
      'neutral': 0,
      'happy': 0,
      'very-happy': 0
    };

    const factorFrequency = {};

    moods.forEach(mood => {
      moodDistribution[mood.mood]++;
      mood.factors.forEach(factor => {
        factorFrequency[factor] = (factorFrequency[factor] || 0) + 1;
      });
    });

    res.json({
      totalEntries,
      averageMood: Math.round(averageMood * 100) / 100,
      moodDistribution,
      factorFrequency,
      trend: calculateTrend(moods)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log daily mood
router.post('/', auth, [
  body('mood').isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood'),
  body('moodValue').isInt({ min: 1, max: 5 }).withMessage('Mood value must be between 1 and 5'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
  body('factors').optional().isArray().withMessage('Factors must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if mood already logged today
    const existingMood = await Mood.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    if (existingMood) {
      // Update existing mood
      Object.assign(existingMood, req.body);
      await existingMood.save();
      res.json(existingMood);
    } else {
      // Create new mood entry
      const mood = new Mood({
        ...req.body,
        user: req.user._id,
        date: new Date()
      });

      await mood.save();
      res.status(201).json(mood);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get today's mood
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mood = await Mood.findOne({
      user: req.user._id,
      date: { $gte: today }
    });

    res.json(mood);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate mood trend
function calculateTrend(moods) {
  if (moods.length < 7) return 'insufficient-data';

  const recent = moods.slice(0, 7);
  const older = moods.slice(7, 14);

  if (older.length === 0) return 'insufficient-data';

  const recentAvg = recent.reduce((sum, mood) => sum + mood.moodValue, 0) / recent.length;
  const olderAvg = older.reduce((sum, mood) => sum + mood.moodValue, 0) / older.length;

  const difference = recentAvg - olderAvg;

  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
}

module.exports = router;
