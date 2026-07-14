const taskRepository = require('../repositories/taskRepository');
const AppError = require('../utils/AppError');
const { paginationHelpers } = require('../helpers');
const { addTaskToQueue } = require('../queues');
const { TASK_STATUS } = require('../constants');

class TaskService {
  /**
   * Create a new task and push it to the processing queue.
   * @param {string} userId 
   * @param {Object} taskData 
   * @returns {Promise<Task>}
   */
  async createTask(userId, { title, inputText, operationType }) {
    // 1. Create and save task in database with status PENDING
    const task = await taskRepository.createTask({
      user: userId,
      title,
      inputText,
      operationType,
      status: TASK_STATUS.PENDING,
    });

    try {
      // 2. Immediately attempt to push job details to Redis
      await addTaskToQueue(task);
    } catch (error) {
      // 3. Graceful failure: update database log & mark task as FAILED if Redis is down
      await taskRepository.updateTask(task._id, {
        status: TASK_STATUS.FAILED,
        errorMessage: `Task submission pipeline failed: ${error.message}`,
        executionLogs: [`[System Error] Failed to submit job to task broker: ${error.message}`],
      });
      throw error;
    }

    return task;
  }

  /**
   * Retrieve all paginated and filtered tasks belonging to the user.
   * @param {string} userId 
   * @param {Object} queryParams 
   * @returns {Promise<{tasks: Array<Task>, meta: Object}>}
   */
  async getAllTasks(userId, queryParams) {
    const { page = 1, limit = 10, search, status, operationType, sort } = queryParams;

    const { skip, limit: parsedLimit } = paginationHelpers.getPaginationOptions(page, limit);

    const { tasks, total } = await taskRepository.findAllTasks({
      userId,
      search,
      status,
      operationType,
      sort,
      skip,
      limit: parsedLimit,
    });

    const meta = paginationHelpers.createPaginationMeta(total, page, parsedLimit);

    return { tasks, meta };
  }

  /**
   * Retrieve a single task by ID after validating ownership.
   * @param {string} taskId 
   * @param {string} userId 
   * @returns {Promise<Task>}
   */
  async getTaskById(taskId, userId) {
    const task = await taskRepository.findTaskById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.user.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to access this task', 403);
    }

    return task;
  }

  /**
   * Update task details after validating ownership.
   * @param {string} taskId 
   * @param {string} userId 
   * @param {Object} updateData 
   * @returns {Promise<Task>}
   */
  async updateTask(taskId, userId, updateData) {
    // Check ownership first
    await this.getTaskById(taskId, userId);

    const updatedTask = await taskRepository.updateTask(taskId, updateData);
    if (!updatedTask) {
      throw new AppError('Failed to update task', 400);
    }

    return updatedTask;
  }

  /**
   * Delete a task after validating ownership.
   * @param {string} taskId 
   * @param {string} userId 
   * @returns {Promise<void>}
   */
  async deleteTask(taskId, userId) {
    // Check ownership first
    await this.getTaskById(taskId, userId);

    const deletedTask = await taskRepository.deleteTask(taskId);
    if (!deletedTask) {
      throw new AppError('Failed to delete task', 400);
    }
  }
}

module.exports = new TaskService();
