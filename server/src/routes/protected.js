const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const User = require('../models/User.js');
const { getNotifications, markAsRead } = require('../controllers/notifications/getNotificationsController.js');
const { markAllAsRead } = require('../controllers/notifications/markAllAsReadController.js'); 

// GET /api/notifications - Get user's notifications
router.get('/notifications', authenticateToken, getNotifications);

// PUT /api/notifications/:id/read - Mark single notification as read
router.put('/notifications/:notificationId/read', authenticateToken, markAsRead);

// New: PUT /api/notifications/mark-all-read - Mark all unread notifications as read
router.put('/notifications/mark-all-read', authenticateToken, markAllAsRead);

// Request Structure for Protected Routes:
// - Headers: Authorization: Bearer <jwt_token> (required for all)
// - Body: N/A for GET; depends on POST/PUT (e.g., JSON for updates)
// Response Structure:
// - Success (200): { message: string, data: object/array } (e.g., user profile or list)
// - Errors: 401 { message: string } (no/invalid token), 403 { message: string } (unauthorized role)

module.exports = router;