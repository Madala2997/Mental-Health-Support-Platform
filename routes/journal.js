const express = require('express');
const { body, validationResult } = require('express-validator');
const Journal = require('../models/Journal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all journal entries (feelings wall)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, mood } = req.query;
    const query = { isVisible: true };

    if (mood) query.mood = mood;

    const entries = await Journal.find(query)
      .populate('author', 'name role', null, { match: { isAnonymous: false } })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out author info for anonymous posts
    const filteredEntries = entries.map(entry => {
      if (entry.isAnonymous) {
        entry.author = null;
      }
      return entry;
    });

    const total = await Journal.countDocuments(query);

    res.json({
      entries: filteredEntries,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's own journal entries
router.get('/my-entries', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const entries = await Journal.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Journal.countDocuments({ author: req.user._id });

    res.json({
      entries,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create journal entry
router.post('/', auth, [
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
  body('mood').isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy']).withMessage('Invalid mood'),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entry = new Journal({
      ...req.body,
      author: req.user._id
    });

    await entry.save();
    
    if (!entry.isAnonymous) {
      await entry.populate('author', 'name role');
    }

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reaction to journal entry
router.post('/:id/react', auth, [
  body('type').isIn(['heart', 'hug', 'support', 'strength']).withMessage('Invalid reaction type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entry = await Journal.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    // Check if user already reacted
    const existingReaction = entry.reactions.find(
      reaction => reaction.user.toString() === req.user._id.toString()
    );

    if (existingReaction) {
      existingReaction.type = req.body.type;
    } else {
      entry.reactions.push({
        user: req.user._id,
        type: req.body.type
      });
    }

    await entry.save();
    res.json({ message: 'Reaction added', reactions: entry.reactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to journal entry
router.post('/:id/comment', auth, [
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const entry = await Journal.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    entry.comments.push({
      author: req.user._id,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || false
    });

    await entry.save();
    res.json({ message: 'Comment added', comments: entry.comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report journal entry
router.post('/:id/report', auth, async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Journal entry not found' });
    }

    entry.reportCount += 1;
    if (entry.reportCount >= 3) {
      entry.isReported = true;
      entry.isVisible = false;
    }

    await entry.save();
    res.json({ message: 'Entry reported' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
