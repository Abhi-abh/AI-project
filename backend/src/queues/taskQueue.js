const { Queue } = require('bullmq');
const { connection } = require('./queue');
const { QUEUES } = require('../constants');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

let taskQueue;
let addTaskToQueue;

if (global.isRedisMock) {
  logger.warn('Initializing In-Memory Mock Queue instances.');

  taskQueue = {
    client: Promise.resolve(true),
  };

  addTaskToQueue = async (task) => {
    logger.info(`[Mock Queue] Job added in-memory: ID ${task._id} for Task ${task._id}`);
    
    // Simulate successful queueing immediately without background processing
    return { id: task._id.toString() };
  };
} else {
  // Instantiate the Task processing Queue
  taskQueue = new Queue(QUEUES.AI_TASKS, {
    connection,
    defaultJobOptions: {
      attempts: 3, // Retry failed jobs up to 3 times
      backoff: {
        type: 'exponential',
        delay: 5000, // Wait 5 seconds, then 10s, then 20s
      },
      removeOnComplete: {
        age: 3600, // Retain details for 1 hour after successful execution
        count: 100, // Keep last 100 records max
      },
      removeOnFail: {
        age: 86400, // Retain details for 24 hours on failures
        count: 500, // Keep last 500 failed records max
      },
    },
  });

  /**
   * Pushes task specifications into BullMQ queues.
   * @param {Object} task - Mongoose task document.
   * @returns {Promise<Object>}
   */
  addTaskToQueue = async (task) => {
    try {
      // Assert Redis is online before queueing
      if (connection.status !== 'ready') {
        logger.error('Redis is offline. Blocking task submission.');
        throw new AppError('Task processing service is temporarily unavailable. Please try again shortly.', 503);
      }

      const job = await taskQueue.add(
        'process-ai-task',
        {
          taskId: task._id.toString(),
          userId: task.user.toString(),
          operationType: task.operationType,
          title: task.title,
          inputText: task.inputText,
          createdAt: task.createdAt,
        },
        {
          jobId: task._id.toString(), // Map jobId directly to taskId to prevent duplicates
        }
      );

      logger.info(`Job successfully enqueued: Job ID ${job.id} for Task ${task._id}`);
      return job;
    } catch (error) {
      logger.error(`Error adding job to queue: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Task queueing pipeline failed.', 500);
    }
  };
}

module.exports = {
  taskQueue,
  addTaskToQueue,
};
