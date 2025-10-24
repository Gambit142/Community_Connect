const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.js');
const { getPendingPosts } = require('../controllers/admin/getPendingPostsController.js');
const { approvePost } = require('../controllers/admin/approvePostController.js');
const { rejectPost } = require('../controllers/admin/rejectPostController.js');

// Middleware: Admin only
router.use(authenticateToken, authorizeRoles('admin'));

// GET /api/admin/posts/pending - Fetch pending posts with filters/pagination
router.get('/posts/pending', getPendingPosts);

// PUT /api/admin/posts/:id/approve - Approve post (update status, notify user)
router.put('/posts/:id/approve', approvePost);

// PUT /api/admin/posts/:id/reject - Reject post (update status, notify user)
router.put('/posts/:id/reject', rejectPost);

module.exports = router;