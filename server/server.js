const http = require('http');
const dotenv = require('dotenv');

// Handle uncaught exceptions before loading app
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down server...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Load environment variables
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const { verifyEmailConnection } = require('./config/email');
const { initSocket } = require('./config/socket');

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start Server Application
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Verify Email Connection (non-blocking)
    verifyEmailConnection();

    // 3. Listen for incoming HTTP & WebSocket connections
    server.listen(PORT, () => {
      console.log(`
============================================================
🚀 LEARNHUB AI SERVER RUNNING
============================================================
📡 Port:         ${PORT}
🌐 Mode:         ${process.env.NODE_ENV || 'development'}
🔗 URL:          http://localhost:${PORT}
💚 Health Check: http://localhost:${PORT}/api/health
============================================================
      `);
    });
  } catch (error) {
    console.error(`❌ Server startup failure: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down server gracefully...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
