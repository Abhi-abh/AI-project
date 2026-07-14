const express = require('express');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidator');

const router = express.Router();

// Apply auth protection middleware to all endpoints
router.use(protect);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
