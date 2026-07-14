const { z } = require('zod');
const { emailRule, passwordRule } = require('./commonRules');

const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: emailRule,
  password: passwordRule,
});

const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, 'Password is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
