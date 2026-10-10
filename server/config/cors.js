/**
 * CORS Configuration for LearnHub AI API
 * Supports multi-origin setups for local dev, Vercel frontend, and Render backend
 */

const normalizeOrigin = (url) => {
  if (!url) return '';
  return url.trim().replace(/\/+$/, '');
};

// Parse client URLs from environment variable (supports comma-separated list)
const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultAllowedOrigins]));

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const cleanOrigin = normalizeOrigin(origin);

  // 1. Direct match with configured or default origins
  if (allowedOrigins.includes(cleanOrigin)) {
    return true;
  }

  // 2. Allow Vercel, Netlify, and Render deployments/previews
  const isVercel = /\.vercel\.app$/.test(cleanOrigin);
  const isNetlify = /\.netlify\.app$/.test(cleanOrigin);
  const isRender = /\.onrender\.com$/.test(cleanOrigin);
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);

  if (isVercel || isNetlify || isRender || isLocalhost) {
    return true;
  }

  // 3. Open CORS if explicitly configured
  if (process.env.CORS_ALLOW_ALL === 'true') {
    return true;
  }

  return false;
};

const corsOptions = {
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    console.warn(`⚠️ Blocked by CORS: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Set-Cookie']
};

corsOptions.corsOptions = corsOptions;
corsOptions.allowedOrigins = allowedOrigins;
corsOptions.isOriginAllowed = isOriginAllowed;

module.exports = corsOptions;
