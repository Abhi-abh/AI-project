/**
 * Common System Constants
 */

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

const ROLES = {
  USER: 'user',
  DEVELOPER: 'developer',
  ADMIN: 'admin',
};

const TASK_STATUS = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};

const OPERATION_TYPES = {
  UPPERCASE: 'UPPERCASE',
  LOWERCASE: 'LOWERCASE',
  REVERSE: 'REVERSE',
  WORD_COUNT: 'WORD_COUNT',
};

const QUEUES = {
  AI_TASKS: 'ai-tasks-queue',
  DLQ: 'ai-tasks-dlq',
};

const API = {
  V1_PREFIX: '/api/v1',
};

module.exports = {
  HTTP_STATUS,
  ROLES,
  TASK_STATUS,
  OPERATION_TYPES,
  QUEUES,
  API,
};
