const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { auth, counselorAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's chats
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'name role')
    .sort({ lastMessage: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single chat
router.get('/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id
    }).populate('participants', 'name role')
      .populate('messages.sender', 'name role');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start chat with counselor
router.post('/counselor', auth, async (req, res) => {
  try {
    // Find available counselors
    const counselors = await User.find({ 
      role: 'counselor',
      isVerified: true 
    });

    if (counselors.length === 0) {
      return res.status(404).json({ message: 'No counselors available' });
    }

    // For now, assign to first available counselor
    // In production, implement proper load balancing
    const counselor = counselors[0];

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, counselor._id] },
      type: 'counselor',
      isActive: true
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, counselor._id],
        type: 'counselor'
      });
      await chat.save();
    }

    await chat.populate('participants', 'name role');
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start peer chat
router.post('/peer/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    const peer = await User.findById(userId);
    if (!peer) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
      type: 'peer',
      isActive: true
    });

    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, userId],
        type: 'peer'
      });
      await chat.save();
    }

    await chat.populate('participants', 'name role');
    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/:id/message', auth, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      sender: req.user._id,
      content: req.body.content,
      type: req.body.type || 'text'
    };

    chat.messages.push(message);
    chat.lastMessage = new Date();
    await chat.save();

    await chat.populate('messages.sender', 'name role');
    const newMessage = chat.messages[chat.messages.length - 1];

    res.json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      participants: req.user._id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark all messages as read for this user
    chat.messages.forEach(message => {
      const readStatus = message.isRead.find(
        read => read.user.toString() === req.user._id.toString()
      );
      
      if (!readStatus) {
        message.isRead.push({
          user: req.user._id,
          readAt: new Date()
        });
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available counselors
router.get('/counselors/available', auth, async (req, res) => {
  try {
    const counselors = await User.find({
      role: 'counselor',
      isVerified: true
    }).select('name profile.bio profile.specializations lastActive');

    res.json(counselors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
