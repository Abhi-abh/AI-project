const express = require('express');
const { successResponse } = require('../utils/response');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');

const router = express.Router();

// Base API route
router.get('/', (req, res) => {
  return successResponse(res, 'AI Task Processing Platform API', {
    version: 'v1',
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
