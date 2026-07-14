const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Read the Bearer Token from the Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError('Not authorized to access this resource. No token provided.', 401);
  }

  try {
    // 2. Verify JWT token signature
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3. Load user from the database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('The user account is currently deactivated.', 401);
    }

    // 4. Attach user object to the request context
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your authentication token has expired. Please log in again.', 401);
    }
    throw error;
  }
});

module.exports = { protect };
