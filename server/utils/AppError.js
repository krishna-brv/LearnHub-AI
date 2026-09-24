/**
 * Custom Error Class for operational errors in LearnHub AI
 * Allows setting HTTP status codes and operational flags
 */
class AppError extends Error {
  /**
   * @param {string} message - Error description
   * @param {number} statusCode - HTTP Status Code (4xx / 5xx)
   * @param {Object} [errors=null] - Detailed field validation errors if any
   */
  constructor(message, statusCode, errors = null) {
    super(message);

    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
