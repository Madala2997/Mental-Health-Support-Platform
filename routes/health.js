const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'MindMitra API is healthy',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: require('../package.json').version
  };

  try {
    res.status(200).json(healthCheck);
  } catch (error) {
    healthCheck.message = 'Health check failed';
    res.status(503).json(healthCheck);
  }
});

// Database connection status
router.get('/db', (req, res) => {
  const dbStatus = {
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    timestamp: Date.now()
  };

  const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
  res.status(statusCode).json(dbStatus);
});

module.exports = router;
