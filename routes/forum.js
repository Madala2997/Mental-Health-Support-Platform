const express = require('express');
const { body, validationResult } = require('express-validator');
const Forum = require('../models/Forum');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }

    const posts = await Forum.find(query)
      .populate('author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter out author info for anonymous posts
    const filteredPosts = posts.map(post => {
      if (post.isAnonymous) {
        post.author = { name: 'Anonymous', role: 'student' };
      }
      return post;
    });

    const total = await Forum.countDocuments(query);

    res.json({
      posts: filteredPosts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single forum post
router.get('/:id', async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id)
      .populate('author', 'name role')
      .populate('replies.author', 'name role');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Filter anonymous data
    if (post.isAnonymous) {
      post.author = { name: 'Anonymous', role: 'student' };
    }

    post.replies = post.replies.map(reply => {
      if (reply.isAnonymous) {
        reply.author = { name: 'Anonymous', role: 'student' };
      }
      return reply;
    });

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create forum post
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters'),
  body('category').isIn(['general', 'academic-stress', 'relationships', 'anxiety', 'depression', 'self-care', 'motivation']).withMessage('Invalid category'),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = new Forum({
      ...req.body,
      author: req.user._id
    });

    await post.save();
    
    if (!post.isAnonymous) {
      await post.populate('author', 'name role');
    } else {
      post.author = { name: 'Anonymous', role: 'student' };
    }

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add reply to forum post
router.post('/:id/reply', auth, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Reply must be between 1 and 2000 characters'),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ message: 'This post is locked' });
    }

    post.replies.push({
      author: req.user._id,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || false
    });

    await post.save();
    res.json({ message: 'Reply added', replies: post.replies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upvote forum post
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const upvoteIndex = post.upvotes.indexOf(req.user._id);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(req.user._id);
    }

    await post.save();
    res.json({ upvotes: post.upvotes.length, isUpvoted: upvoteIndex === -1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upvote reply
router.post('/:postId/reply/:replyId/upvote', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const reply = post.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    const upvoteIndex = reply.upvotes.indexOf(req.user._id);
    if (upvoteIndex > -1) {
      reply.upvotes.splice(upvoteIndex, 1);
    } else {
      reply.upvotes.push(req.user._id);
    }

    await post.save();
    res.json({ upvotes: reply.upvotes.length, isUpvoted: upvoteIndex === -1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report forum post
router.post('/:id/report', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.reportCount += 1;
    if (post.reportCount >= 3) {
      post.isReported = true;
    }

    await post.save();
    res.json({ message: 'Post reported' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
