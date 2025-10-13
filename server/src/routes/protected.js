const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.js');
const User = require('../models/User.js');

// Example protected route: Get user profile (any authenticated user)
router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Profile retrieved successfully',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      userType: req.user.userType,
    },
  });
});

// Example admin-only route: Get all users
router.get('/admin/users', authenticateToken, authorizeRoles('admin'), (req, res) => {
  // In production, query all users here (e.g., User.find({}).select('-passwordHash'))
  res.status(200).json({
    message: 'All users retrieved successfully',
    users: [], // Placeholder; replace with actual query
  });
});

// Request Structure for Protected Routes:
// - Headers: Authorization: Bearer <jwt_token> (required for all)
// - Body: N/A for GET; depends on POST/PUT (e.g., JSON for updates)
// Response Structure:
// - Success (200): { message: string, data: object/array } (e.g., user profile or list)
// - Errors: 401 { message: string } (no/invalid token), 403 { message: string } (unauthorized role)

module.exports = router;