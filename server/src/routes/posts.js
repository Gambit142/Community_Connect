const express = require('express');
const router = express.Router();
const multer = require('multer'); // For file uploads
const { cloudinary } = require('../config/cloudinary.js'); // Cloudinary config
const { authenticateToken, authorizeRoles } = require('../middleware/auth.js');
const { createPost } = require('../controllers/posts/createPostController.js');
const { getMyPosts } = require('../controllers/posts/getMyPostsController.js');

// Multer storage config (memory for processing, not disk)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

// Create post (member only, pending approval) with image upload (up to 5 images)
router.post('/', authenticateToken, upload.array('images', 5), createPost);

// Request Structure for Create Post with Images:
// - Method: POST /api/posts (multipart/form-data)
// - Headers: Authorization: Bearer <jwt_token> (required)
// - Form Fields: 
//   - title: string (required)
//   - description: string (required)
//   - category: string enum (required)
//   - tags: string (optional, comma-separated for array)
//   - type: string enum (required)
//   - price: number (optional)
//   - location: string (optional)
//   - details: JSON string (optional, parse in controller)
// - Files: images (multiple files, field name 'images', up to 5, images only)
// Response Structure:
// - Success (201): { "message": "string", "post": { ...post with images array of URLs } }
// - Errors: 400 { "message": "validation/file error" }, 401 { "message": "unauthorized" }, 500 { "message": "server error" }

router.get('/my-posts', authenticateToken, getMyPosts);

// Request Structure for Get My Posts:
// - Method: GET /api/posts/my-posts
// - Headers: Authorization: Bearer <jwt_token> (required)
// - Query Params: 
//   ?status=Pending Approval (optional filter)
//   ?page=1 (optional, default 1)
//   ?limit=10 (optional, default 10, max 50)
// Response Structure:
// - Success (200): { "message": "string", "posts": [post objects], "pagination": { currentPage, totalPages, totalPosts, hasNext } }
// - Errors: 400 { "message": "validation error" }, 401 { "message": "unauthorized" }, 500 { "message": "server error" }

module.exports = router;