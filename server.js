const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://apis.google.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      stylesSrcElem: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://accounts.google.com"],
      connectSrc: ["'self'", "https://accounts.google.com", "https://www.googleapis.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      frameAncestors: ["'self'", "https://accounts.google.com"]
    }
  }
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files from client directory
app.use(express.static(path.join(__dirname, 'client')));

// MongoDB connection (will be updated when user provides URL)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindmitra';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Google OAuth configuration endpoint
app.get('/api/config/google', (req, res) => {
  res.json({
    clientId: process.env.GOOGLE_CLIENT_ID || 'not-configured'
  });
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
  });

  socket.on('send-message', (data) => {
    io.to(data.chatId).emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve specific pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'signup.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dashboard.html'));
});

app.get('/resources', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'resources.html'));
});

app.get('/journal', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'journal.html'));
});

app.get('/forum', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'forum.html'));
});

app.get('/mood', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'mood.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'chat.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'profile.html'));
});

// Serve main HTML file for home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MindMitra server running on port ${PORT}`);
});
