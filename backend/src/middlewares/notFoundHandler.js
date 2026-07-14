const AppError = require('../utils/AppError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found - ${req.originalUrl}`, 404));
};

module.exports = notFoundHandler;
