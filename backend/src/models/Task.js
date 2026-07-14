const mongoose = require('mongoose');
const { TASK_STATUS, OPERATION_TYPES } = require('../constants');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    inputText: {
      type: String,
      required: [true, 'Input text is required'],
    },
    operationType: {
      type: String,
      enum: {
        values: Object.values(OPERATION_TYPES),
        message: 'Invalid operation type. Allowed: UPPERCASE, LOWERCASE, REVERSE, WORD_COUNT',
      },
      required: [true, 'Operation type is required'],
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },
    result: {
      type: String,
      default: null,
    },
    executionLogs: {
      type: [String],
      default: [],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized queries
taskSchema.index({ user: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
