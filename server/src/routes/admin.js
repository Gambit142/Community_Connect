const express = require('express');
const router = express.Router();

// imports for authentication and authorization
const { authenticateToken, authorizeRoles } = require('../middleware/auth.js');

// imports for Posts
const { getPendingPosts } = require('../controllers/admin/getPendingPostsController.js');
const { approvePost } = require('../controllers/admin/approvePostController.js');
const { rejectPost } = require('../controllers/admin/rejectPostController.js');

// imports for Events
const { getPendingEvents } = require('../controllers/admin/getPendingEventsController.js');
const { approveEvent } = require('../controllers/admin/approveEventController.js');
const { rejectEvent } = require('../controllers/admin/rejectEventController.js');

// Middleware: Admin only
router.use(authenticateToken, authorizeRoles('admin'));

// --- Post Moderation Routes ---

// GET /api/admin/posts/pending - Fetch pending posts with filters/pagination
router.get('/posts/pending', getPendingPosts);

// PUT /api/admin/posts/:id/approve - Approve post (update status, notify user)
router.put('/posts/:id/approve', approvePost);

// PUT /api/admin/posts/:id/reject - Reject post (update status, notify user)
router.put('/posts/:id/reject', rejectPost);

// --- Event Moderation Routes (New) ---

// GET /api/admin/events/pending - Fetch pending events with filters/pagination
router.get('/events/pending', getPendingEvents);

// PUT /api/admin/events/:id/approve - Approve event (update status, notify user)
router.put('/events/:id/approve', approveEvent);

// PUT /api/admin/events/:id/reject - Reject event (update status, notify user, requires reason in body)
router.put('/events/:id/reject', rejectEvent);

module.exports = router;