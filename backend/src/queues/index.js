const { connection } = require('./queue');
const { taskQueue, addTaskToQueue } = require('./taskQueue');
const queueEvents = require('./queueEvents');

module.exports = {
  connection,
  taskQueue,
  addTaskToQueue,
  queueEvents,
};
