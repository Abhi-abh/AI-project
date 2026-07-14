const Task = require('../models/Task');

class TaskRepository {
  /**
   * Create a new task.
   * @param {Object} taskData 
   * @returns {Promise<Task>}
   */
  async createTask(taskData) {
    return await Task.create(taskData);
  }

  /**
   * Find a task by ID.
   * @param {string} id 
   * @returns {Promise<Task|null>}
   */
  async findTaskById(id) {
    return await Task.findById(id);
  }

  /**
   * Find and count all tasks matching criteria.
   * @param {Object} filters 
   * @param {string} filters.userId 
   * @param {string} [filters.search] 
   * @param {string} [filters.status] 
   * @param {string} [filters.operationType] 
   * @param {string} [filters.sort] 
   * @param {number} filters.skip 
   * @param {number} filters.limit 
   * @returns {Promise<{tasks: Array<Task>, total: number}>}
   */
  async findAllTasks({ userId, search, status, operationType, sort = '-createdAt', skip = 0, limit = 10 }) {
    const query = { user: userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { inputText: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (operationType) {
      query.operationType = operationType;
    }

    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(query);

    return { tasks, total };
  }

  /**
   * Update task parameters or status.
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Task|null>}
   */
  async updateTask(id, updateData) {
    return await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete a task.
   * @param {string} id 
   * @returns {Promise<Task|null>}
   */
  async deleteTask(id) {
    return await Task.findByIdAndDelete(id);
  }
}

module.exports = new TaskRepository();
