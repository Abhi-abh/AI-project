const { z } = require('zod');
const { OPERATION_TYPES } = require('../constants');

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  inputText: z.string().min(1, 'Input text is required'),
  operationType: z.enum(Object.values(OPERATION_TYPES), {
    errorMap: () => ({ message: 'Invalid operationType. Must be UPPERCASE, LOWERCASE, REVERSE, or WORD_COUNT' }),
  }),
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').optional(),
  inputText: z.string().min(1, 'Input text cannot be empty').optional(),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
};
