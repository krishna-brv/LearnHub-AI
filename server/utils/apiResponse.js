/**
 * Standardized API Response Helpers
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object|Array} [data={}] - Response payload
 * @param {number} [statusCode=200] - HTTP status code
 * @param {Object} [meta=null] - Pagination / metadata if any
 */
const successResponse = (res, message = 'Success', data = {}, statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error description
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object|Array} [error={}] - Additional error details
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, error = {}) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error || {}
  });
};

module.exports = {
  successResponse,
  errorResponse
};
