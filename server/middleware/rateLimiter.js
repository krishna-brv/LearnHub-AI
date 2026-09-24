const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 500,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    error: { code: 'RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth Endpoints Limiter (Login / Register / Password Reset)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: { code: 'AUTH_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * AI Endpoints Rate Limiter
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 100,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a while before sending more AI requests.',
    error: { code: 'AI_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Upload Rate Limiter
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 500 : 50,
  message: {
    success: false,
    message: 'File upload limit reached. Please try again after an hour.',
    error: { code: 'UPLOAD_RATE_LIMIT_EXCEEDED' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
  uploadLimiter
};
