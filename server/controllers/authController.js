const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');
const { successResponse } = require('../utils/apiResponse');

// Helper to set HTTP-only refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  };

  res.cookie('refreshToken', token, cookieOptions);
};

// Helper to clear refresh token cookie
const clearRefreshTokenCookie = (res) => {
  res.cookie('refreshToken', '', {
    expires: new Date(0),
    httpOnly: true
  });
};

/**
 * Register User
 * POST /api/auth/register
 */
exports.register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return successResponse(res, result.message, { user: result.user }, 201);
});

/**
 * Verify Email OTP Code
 * POST /api/auth/verify-email
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyEmailOTP(email, otp);

  setRefreshTokenCookie(res, result.refreshToken);

  return successResponse(res, 'Email verified successfully! You are now logged in.', {
    user: result.user,
    accessToken: result.accessToken
  });
});

/**
 * Resend OTP Code
 * POST /api/auth/resend-otp
 */
exports.resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.resendOTP(email);
  return successResponse(res, result.message);
});

/**
 * Login User
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const identifier = email || username || req.body.emailOrUsername;

  const device = req.headers['user-agent'] || 'Browser';
  const ip = req.ip || req.connection.remoteAddress;

  const result = await authService.login(identifier, password, device, ip);

  setRefreshTokenCookie(res, result.refreshToken);

  return successResponse(res, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken
  });
});

/**
 * Refresh Access Token
 * POST /api/auth/refresh-token
 */
exports.refreshToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  const result = await authService.refreshAccessToken(incomingToken);

  return successResponse(res, 'Access token refreshed', {
    accessToken: result.accessToken
  });
});

/**
 * Logout User
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  await authService.logout(req.user._id, refreshToken);

  clearRefreshTokenCookie(res);

  return successResponse(res, 'Logged out successfully');
});

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  return successResponse(res, result.message);
});

/**
 * Reset Password
 * POST /api/auth/reset-password/:token
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await authService.resetPassword(token, password);
  setRefreshTokenCookie(res, result.refreshToken);

  return successResponse(res, result.message, {
    accessToken: result.accessToken
  });
});

/**
 * Change Password (Authenticated)
 * PUT /api/auth/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user._id, currentPassword, newPassword);

  return successResponse(res, result.message, {
    accessToken: result.accessToken
  });
});

/**
 * Get Current Logged In User
 * GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  return successResponse(res, 'Current user profile fetched', { user: req.user });
});
