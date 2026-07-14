const taskService = require('../services/taskService');
const { successResponse, paginationResponse } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

// @desc    Create a new task & queue it
// @route   POST /api/v1/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user._id, req.body);
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Task queued successfully',
    task,
  });
});

// @desc    Get all paginated and filtered tasks belonging to authenticated user
// @route   GET /api/v1/tasks
// @access  Private
const getAllTasks = asyncHandler(async (req, res) => {
  const { tasks, meta } = await taskService.getAllTasks(req.user._id, req.query);
  return paginationResponse(res, 'Tasks retrieved successfully', tasks, meta, HTTP_STATUS.OK);
});

// @desc    Get a single task by ID
// @route   GET /api/v1/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id);
  return successResponse(res, 'Task retrieved successfully', task, HTTP_STATUS.OK);
});

// @desc    Update an existing task
// @route   PUT /api/v1/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.user._id, req.body);
  return successResponse(res, 'Task updated successfully', task, HTTP_STATUS.OK);
});

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.params.id, req.user._id);
  return successResponse(res, 'Task deleted successfully', null, HTTP_STATUS.OK);
});

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
