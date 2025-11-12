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

// Imports for Flagged Comments
const { getFlaggedCommentsController } = require('../controllers/admin/getFlaggedCommentsController.js');
const { unflagCommentController } = require('../controllers/admin/unflagCommentController.js');
const { deleteFlaggedCommentController } = require('../controllers/admin/deleteFlaggedCommentController.js');

// imports for Analytics
const { getAnalytics } = require('../controllers/admin/analyticsController.js');

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

// --- Flagged Comments Moderation Routes (New) ---

// GET /api/admin/comments/flagged - Fetch flagged comments with pagination
router.get('/comments/flagged', getFlaggedCommentsController);

// POST /api/admin/comments/:commentId/unflag - Unflag/approve comment
router.post('/comments/:commentId/unflag', unflagCommentController);

// DELETE /api/admin/comments/:commentId - Admin soft-delete flagged comment
router.delete('/comments/:commentId', deleteFlaggedCommentController);

// --- Analytics Route ---
// GET /api/admin/analytics - Fetch analytics data
router.get('/analytics', authenticateToken, authorizeRoles('admin'), getAnalytics);

module.exports = router;