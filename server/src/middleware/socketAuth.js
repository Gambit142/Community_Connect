const jwt = require('jsonwebtoken');

const setupSocketAuth = (io) => {
  // Middleware for Socket.io auth (validate JWT on connect)
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userID = decoded.id;
      socket.role = decoded.role; // From JWT payload
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Join user to role-based room on connect
  io.on('connection', (socket) => {
    console.log(`User ${socket.userID} connected`);
    socket.join(`role-${socket.role}`); // e.g., 'role-admin' room for admins

    socket.on('disconnect', () => {
      console.log(`User ${socket.userID} disconnected`);
    });
  });

  return io; // Return for chaining if needed
};

module.exports = { setupSocketAuth };