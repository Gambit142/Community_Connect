const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authenticateToken.js');
const uploadProfilePic = require('../middleware/uploadProfilePic.js');

const getProfile = require('../controllers/users/getProfile.js');
const updateProfile = require('../controllers/users/updateProfile.js');
const updateUserByAdmin = require('../controllers/users/updateUserByAdmin.js');

// User routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, uploadProfilePic, updateProfile);

// Admin routes
router.put(
  '/admin/users/:userId',
  authenticateToken,
  authorizeRoles('admin'),
  uploadProfilePic,
  updateUserByAdmin
);

module.exports = router;