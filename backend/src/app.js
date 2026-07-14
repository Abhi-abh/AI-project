const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const config = require('./config');
const connectDB = require('./config/db');
const checkRedisPort = require('./config/redisCheck');
const logger = require('./utils/logger');

const app = express();

// Async initialization boot sequence
const bootServer = async () => {
  // 1. Connect MongoDB (falls back to memory server if local 27017 connection fails)
  await connectDB();

  // 2. Perform Redis port validation check
  const isRedisAvailable = await checkRedisPort();
  if (!isRedisAvailable) {
    global.isRedisMock = true;
    logger.warn('⚠️  Redis port 6379 is offline. Switching to Mock In-Memory Queue Mode.');
  }

  // 3. Dynamically require routing & queues only after mock status flags are resolved
  const routes = require('./routes');
  const { connection: redisConnection } = require('./queues');

  // Security Headers & Cross-Origin
  app.use(helmet());
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  }));

  // Performance Optimization
  app.use(compression());

  // Payload Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Traceability & Logging Middlewares
  const { requestId, requestLogger } = require('./middlewares/requestLogger');
  app.use(requestId);
  app.use(requestLogger);

  // Rate Limiter
  const apiLimiter = rateLimit({
    windowMs: config.app.rateLimitWindowMs,
    max: config.app.env === 'development' ? 5000 : config.app.rateLimitMax, // Boost limits in dev
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  // API Routing Mount
  app.use('/api/v1', routes);

  // Extended Health Check API
  app.get('/health', async (req, res) => {
    let mongoStatus = 'disconnected';
    let redisStatus = 'disconnected';
    let queueStatus = 'offline';

    // Probe MongoDB
    try {
      const state = mongoose.connection.readyState;
      if (state === 1) mongoStatus = 'connected';
      else if (state === 2) mongoStatus = 'connecting';
    } catch (err) {
      mongoStatus = `error: ${err.message}`;
    }

    // Probe Redis Connection
    try {
      redisStatus = global.isRedisMock ? 'mocked (in-memory)' : (redisConnection.status || 'disconnected');
    } catch (err) {
      redisStatus = `error: ${err.message}`;
    }

    // Probe BullMQ Queue Status
    try {
      if (global.isRedisMock) {
        queueStatus = 'mocked (online)';
      } else {
        const { taskQueue } = require('./queues');
        const isClientReady = await taskQueue.client;
        if (isClientReady && redisConnection.status === 'ready') {
          queueStatus = 'online';
        }
      }
    } catch (err) {
      queueStatus = `error: ${err.message}`;
    }

    const isHealthy = mongoStatus === 'connected' && (redisStatus === 'ready' || global.isRedisMock);

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
        queue: queueStatus,
      },
    });
  });

  // Fallback Not Found Route
  const notFoundHandler = require('./middlewares/notFoundHandler');
  app.use(notFoundHandler);

  // Global Error Handler Middleware
  const errorHandler = require('./middlewares/errorMiddleware');
  app.use(errorHandler);

  const PORT = config.app.port;
  app.listen(PORT, () => {
    logger.info(`Server running in ${config.app.env} mode on port ${PORT}`);
  });
};

bootServer();

module.exports = app;
