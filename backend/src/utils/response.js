/**
 * Standard HTTP Response utility helpers.
 */

/**
 * Sends a success response.
 * @param {Response} res - Express response object.
 * @param {string} message - User-friendly message.
 * @param {Object|Array} data - Payload to send.
 * @param {number} [statusCode=200] - HTTP status code.
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends an error response.
 * @param {Response} res - Express response object.
 * @param {string} message - Error explanation message.
 * @param {number} [statusCode=500] - HTTP status code.
 * @param {Array|Object} [errors=null] - Specific field-level validation errors.
 */
const errorResponse = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends a paginated success response.
 * @param {Response} res - Express response object.
 * @param {string} message - User-friendly message.
 * @param {Array} data - Paginated data array.
 * @param {Object} paginationInfo - Pagination metadata.
 * @param {number} paginationInfo.page - Current page.
 * @param {number} paginationInfo.limit - Items per page.
 * @param {number} paginationInfo.totalItems - Total matches in DB.
 * @param {number} paginationInfo.totalPages - Total calculated pages.
 * @param {number} [statusCode=200] - HTTP status code.
 */
const paginationResponse = (res, message, data, paginationInfo, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: Number(paginationInfo.page),
      limit: Number(paginationInfo.limit),
      totalItems: Number(paginationInfo.totalItems),
      totalPages: Number(paginationInfo.totalPages),
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
};
