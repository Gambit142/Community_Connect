const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const http = require('http');
const authRoutes = require('./routes/auth.js');
const protectedRoutes = require('./routes/protected.js');
const postRoutes = require('./routes/posts.js');
const adminRoutes = require('./routes/admin.js');
const eventRoutes = require('./routes/events.js'); 
const { initSocket } = require('./config/socket.js'); // Import init

const app = express();
const server = http.createServer(app); // HTTP server

// Connect to DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/', (req, res) => res.status(200).send('Server is running'));

// Initialize Socket.io
const io = initSocket(server); // Get io instance
global.io = io; // Export globally to avoid circular dependency issues

// HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Listen only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'undefined'} mode`);
  });
}

module.exports = { app, server, io }; // Export io for use in routes