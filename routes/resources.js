const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all resources (public)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const resources = await Resource.find(query)
      .populate('author', 'name role')
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

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('author', 'name role');

    if (!resource || !resource.isPublished) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create resource (admin only)
router.post('/', adminAuth, [
  body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('type').isIn(['article', 'video', 'guide', 'exercise']).withMessage('Invalid type'),
  body('category').isIn(['stress-management', 'anxiety', 'motivation', 'depression', 'self-care', 'mindfulness', 'academic-pressure']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const resource = new Resource({
      ...req.body,
      author: req.user._id
    });

    await resource.save();
    await resource.populate('author', 'name role');

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/unlike resource
router.post('/:id/like', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const likeIndex = resource.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      resource.likes.splice(likeIndex, 1);
    } else {
      resource.likes.push(req.user._id);
    }

    await resource.save();
    res.json({ likes: resource.likes.length, isLiked: likeIndex === -1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/meta/categories', (req, res) => {
  const categories = [
    'stress-management',
    'anxiety',
    'motivation',
    'depression',
    'self-care',
    'mindfulness',
    'academic-pressure'
  ];
  res.json(categories);
});

module.exports = router;
