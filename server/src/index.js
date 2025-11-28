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
const commentsRoutes = require('./routes/comments.js');
const userRoutes = require('./routes/users.js');
const { initSocket } = require('./config/socket.js');

const app = express();
const server = http.createServer(app);

connectDB();

app.use(helmet());

const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:10200',
    'http://localhost:5174',
    'http://localhost:5173',
  ];
  
  if (process.env.NODE_ENV === 'production') {
    origins.push('https://comcon.nasgrid.tech');
  }
  
  return origins;
};

app.use(cors({
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Stripe webhook route BEFORE express.json()
app.use('/api/events/webhook', express.raw({type: 'application/json'}));

// All other routes use JSON parser
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.status(200).send('Server is running'));

const io = initSocket(server);
global.io = io;

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = { app, server, io };