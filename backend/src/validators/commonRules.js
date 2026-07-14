const { z } = require('zod');
const mongoose = require('mongoose');

// Custom validator for MongoDB Object IDs
const objectIdSchema = z.string().refine((val) => {
  return mongoose.Types.ObjectId.isValid(val);
}, {
  message: 'Invalid MongoDB ObjectId format',
});

// Common pagination validation rules
const paginationQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }),
  limit: z.string().optional().default('10').transform((val) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? 10 : parsed;
  }),
  sort: z.string().optional().default('-createdAt'),
});

// Common search & query patterns
const emailRule = z.string().trim().min(1, 'Email is required').email('Invalid email address');
const passwordRule = z.string().min(8, 'Password must be at least 8 characters');

module.exports = {
  objectIdSchema,
  paginationQuerySchema,
  emailRule,
  passwordRule,
};
