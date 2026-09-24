const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

/**
 * Configure Mongo Sanitize Middleware
 * Strips out $ and . characters from user-supplied data to prevent Mongo Query Injection
 */
const sanitizeMongo = mongoSanitize({
  allowDots: false,
  replaceWith: '_'
});

/**
 * Configure XSS Clean Middleware
 * Sanitizes user input HTML to prevent Cross-Site Scripting
 */
const sanitizeXSS = xss();

module.exports = {
  sanitizeMongo,
  sanitizeXSS
};
