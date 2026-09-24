const AppError = require('../utils/AppError');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Handle MongoDB CastError (e.g. invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Fields error (E11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value '${value}' for ${field}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Validation Error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, errors);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

/**
 * Central Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Log error for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 ERROR DETAILS:', err);
  }

  // Handle specific database and auth errors
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // If operational error (AppError), return user-friendly message
  if (error.isOperational) {
    return errorResponse(res, error.message, error.statusCode, error.errors || {});
  }

  // Fallback for unexpected programming or system errors
  console.error('💥 UNHANDLED CRITICAL ERROR:', err);
  return errorResponse(
    res,
    process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server.',
    500
  );
};

module.exports = errorHandler;
