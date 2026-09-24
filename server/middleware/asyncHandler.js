/**
 * Wrapper for async route controllers to catch unhandled promise rejections
 * and pass them to the global error handler middleware.
 * 
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
