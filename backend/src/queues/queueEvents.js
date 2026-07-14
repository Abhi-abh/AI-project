const { QueueEvents } = require('bullmq');
const { connection } = require('./queue');
const { QUEUES } = require('../constants');
const logger = require('../utils/logger');
const EventEmitter = require('events');

let queueEvents;

if (global.isRedisMock) {
  class MockQueueEvents extends EventEmitter {}
  queueEvents = new MockQueueEvents();
  logger.warn('Initializing In-Memory Mock QueueEvents listener.');
} else {
  // Initialize QueueEvents listener
  queueEvents = new QueueEvents(QUEUES.AI_TASKS, { connection });

  queueEvents.on('waiting', ({ jobId }) => {
    logger.info(`[Queue Event] Job ${jobId} is waiting in the queue.`);
  });

  queueEvents.on('active', ({ jobId }) => {
    logger.info(`[Queue Event] Job ${jobId} is now active (processing started).`);
  });

  queueEvents.on('completed', ({ jobId, returnvalue }) => {
    logger.info(`[Queue Event] Job ${jobId} completed. Return value: ${JSON.stringify(returnvalue)}`);
  });

  queueEvents.on('failed', ({ jobId, failedReason }) => {
    logger.error(`[Queue Event] Job ${jobId} failed. Reason: ${failedReason}`);
  });

  queueEvents.on('stalled', ({ jobId }) => {
    logger.warn(`[Queue Event] Job ${jobId} stalled (worker lost connection).`);
  });

  queueEvents.on('removed', ({ jobId }) => {
    logger.info(`[Queue Event] Job ${jobId} was removed from the queue.`);
  });

  queueEvents.on('error', (error) => {
    logger.error(`[Queue Event] Global QueueEvents Error: ${error.message}`);
  });
}

module.exports = queueEvents;
