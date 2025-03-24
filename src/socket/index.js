const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Join user to their personal room
    socket.join(socket.user._id.toString());

    // Handle book updates
    socket.on('bookUpdated', (bookData) => {
      // Emit to author's room
      io.to(bookData.authorId.toString()).emit('bookUpdate', {
        type: 'UPDATE',
        book: bookData
      });
    });

    // Handle author updates
    socket.on('authorUpdated', (authorData) => {
      io.to(authorData._id.toString()).emit('authorUpdate', {
        type: 'UPDATE',
        author: authorData
      });
    });

    // Handle dashboard updates
    socket.on('dashboardUpdated', (dashboardData) => {
      io.to(socket.user._id.toString()).emit('dashboardUpdate', dashboardData);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

module.exports = setupSocket;