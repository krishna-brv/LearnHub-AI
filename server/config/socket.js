const { Server } = require('socket.io');

let io = null;

/**
 * Initialize Socket.IO server
 * @param {Object} httpServer - Node HTTP server instance
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user's personal notification room
    socket.on('join_user_room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user room: user_${userId}`);
      }
    });

    // Join course discussion room
    socket.on('join_course_room', (courseId) => {
      if (courseId) {
        socket.join(`course_${courseId}`);
        console.log(`Socket ${socket.id} joined course room: course_${courseId}`);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', ({ conversationId, userId, userName }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', { userId, userName });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', { userId });
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });

  return io;
};

/**
 * Get active Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized! Call initSocket first.');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};
