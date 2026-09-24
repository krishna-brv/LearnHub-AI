const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate Access Token (15m lifetime by default)
 * @param {Object} user - User document
 * @returns {string} Signed JWT Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username
    },
    process.env.JWT_SECRET || 'learnhub_ai_super_secret_jwt_access_key_2026_production_grade',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    }
  );
};

/**
 * Generate Refresh Token (7d lifetime by default)
 * @param {Object} user - User document
 * @returns {string} Signed JWT Refresh Token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      version: user.passwordChangedAt ? user.passwordChangedAt.getTime() : 0
    },
    process.env.JWT_REFRESH_SECRET || 'learnhub_ai_super_secret_jwt_refresh_key_2026_production_grade',
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Verify Access Token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_SECRET || 'learnhub_ai_super_secret_jwt_access_key_2026_production_grade'
  );
};

/**
 * Verify Refresh Token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET || 'learnhub_ai_super_secret_jwt_refresh_key_2026_production_grade'
  );
};

/**
 * Generate 6-digit numeric OTP
 * @returns {string} 6-digit OTP code
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate cryptographically secure random token (for password reset)
 * @returns {Object} { rawToken, hashedToken, expiresAt }
 */
const generateRandomToken = (expirationMinutes = 10) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

  return {
    rawToken,
    hashedToken,
    expiresAt
  };
};

/**
 * Hash a plain token string using SHA256
 * @param {string} token
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  generateRandomToken,
  hashToken
};
