const morgan = require('morgan');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Middleware to assign a unique request ID to each request
const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
};

// Custom Morgan token to log request ID
morgan.token('id', (req) => req.id);

// Custom format combining trace logs
const morganFormat = ':id :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// Create morgan stream that routes to Winston logger
const requestLogger = morgan(morganFormat, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
});

module.exports = {
  requestId,
  requestLogger,
};
