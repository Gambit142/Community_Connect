const http = require('http'); // Only if not in index
const { Server } = require('socket.io');
const { setupSocketAuth } = require('../middleware/socketAuth.js');
const app = require('../index.js'); // Wait, circular—use passed app/server

let io; // Singleton

const initSocket = (server) => {
  if (io) return io; // Already initialized

  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  setupSocketAuth(io);

  return io;
};

module.exports = { initSocket };