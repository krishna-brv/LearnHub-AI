const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

/**
 * Protect route — Verify JWT access token & attach active user to req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Bearer header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to access this resource.', 401));
  }

  // 2. Verify token
  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4. Check if user account is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  // 5. Check if user changed password after token was issued
  if (currentUser.passwordChangedAt) {
    const changedTimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);
    if (decoded.iat < changedTimestamp) {
      return next(new AppError('User recently changed password! Please log in again.', 401));
    }
  }

  // 6. Grant access — attach user to request object
  req.user = currentUser;
  next();
});

/**
 * Optional Auth — attaches req.user if token is present, but doesn't block unauthenticated requests
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.id);
    if (currentUser && currentUser.isActive) {
      req.user = currentUser;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth
  }

  next();
});

module.exports = {
  protect,
  optionalAuth
};
