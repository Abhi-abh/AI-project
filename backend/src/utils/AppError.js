class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag for known operational errors vs system programming crashes

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
