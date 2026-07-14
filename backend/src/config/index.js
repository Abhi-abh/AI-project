const { z } = require('zod');
require('dotenv').config();

// Environment Schema Validation
const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_HOST: z.string().default('127.0.0.1'),
  REDIS_PORT: z.string().default('6379').transform((val) => parseInt(val, 10)),
  REDIS_PASSWORD: z.string().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('100').transform((val) => parseInt(val, 10)),
});

// Perform validation
let validatedEnv;
try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  console.error('❌ Environment validation failed! Please check your .env variables:');
  error.errors.forEach((err) => {
    console.error(`   - ${err.path.join('.')}: ${err.message}`);
  });
  process.exit(1);
}

const config = {
  app: {
    port: validatedEnv.PORT,
    env: validatedEnv.NODE_ENV,
    rateLimitWindowMs: validatedEnv.RATE_LIMIT_WINDOW_MS,
    rateLimitMax: validatedEnv.RATE_LIMIT_MAX,
  },
  db: {
    uri: validatedEnv.MONGO_URI,
  },
  redis: {
    host: validatedEnv.REDIS_HOST,
    port: validatedEnv.REDIS_PORT,
    password: validatedEnv.REDIS_PASSWORD,
  },
  jwt: {
    secret: validatedEnv.JWT_SECRET,
    expiresIn: validatedEnv.JWT_EXPIRES_IN,
  },
};

module.exports = config;
