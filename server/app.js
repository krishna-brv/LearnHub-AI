const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const hpp = require('hpp');

const corsOptions = require('./config/cors');
const { sanitizeMongo, sanitizeXSS } = require('./middleware/sanitize');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const { successResponse } = require('./utils/apiResponse');

// Initialize Express App
const app = express();

// Trust proxy for rate limiting on Render / Vercel reverse proxies
app.set('trust proxy', 1);

// 1. Security HTTP Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable default CSP to allow external media resources like YouTube
  crossOriginEmbedderPolicy: false
}));

// 2. CORS Policy
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Request Logging (Development mode)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Rate Limiting for all /api routes
app.use('/api', apiLimiter);

// 5. Body Parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 6. Data Sanitization against NoSQL Query Injection & XSS
app.use(sanitizeMongo);
app.use(sanitizeXSS);

// 7. Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: ['category', 'level', 'language', 'status', 'rating', 'type', 'tags', 'difficulty']
}));

// 8. Compression
app.use(compression());

// 9. Health Check Route
app.get('/api/health', (req, res) => {
  return successResponse(res, 'LearnHub AI API is healthy and operational', {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

const path = require('path');
const fs = require('fs');

// 10. API Routes Mount Point
const routes = require('./routes');
app.use('/api', routes);

// 11. Serve Frontend Static Build (for full-stack MERN single-service hosting on Render/Railway)
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath) && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    // Let unhandled API routes continue to 404 handler
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 12. Handle Unhandled Routes (404)
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// 13. Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
