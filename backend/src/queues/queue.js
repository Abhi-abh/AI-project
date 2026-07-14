const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

let connection;

if (global.isRedisMock) {
  logger.warn('Initializing In-Memory Mock Redis connection client.');
  
  // Fake connection object matching interface
  connection = {
    status: 'ready',
    on: () => {},
    once: () => {},
    quit: () => Promise.resolve(),
  };
} else {
  const redisOptions = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    maxRetriesPerRequest: null, // Critical requirement for BullMQ
    enableReadyCheck: false,
  };

  connection = new Redis(redisOptions);

  connection.on('connect', () => {
    logger.info(`Redis Connected successfully to ${config.redis.host}:${config.redis.port}`);
  });

  connection.on('error', (err) => {
    logger.error(`Redis Connection Error: ${err.message}`);
  });
}

module.exports = {
  connection,
};
