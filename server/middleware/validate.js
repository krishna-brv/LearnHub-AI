const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Express-validator runner middleware
 * Evaluates validation rules and formats errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg
  }));

  const firstErrorMsg = extractedErrors[0]?.message || 'Validation failed';
  return next(new AppError(firstErrorMsg, 400, extractedErrors));
};

module.exports = validate;
