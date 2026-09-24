const AppError = require('../utils/AppError');

/**
 * Restrict route access to specific roles
 * @param  {...string} allowedRoles - List of allowed roles (e.g. 'admin', 'instructor', 'mentor')
 * @returns {Function} Express middleware
 */
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated! Please log in.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Role '${req.user.role}' is not authorized to perform this action. Required: [${allowedRoles.join(', ')}]`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  restrictTo
};
