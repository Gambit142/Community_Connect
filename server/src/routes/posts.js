const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth.js');
const { createPost } = require('../controllers/posts/createPostController.js');
const { getMyPosts } = require('../controllers/posts/getMyPostsController.js');

// Create post (member only, pending approval)
router.post('/', authenticateToken, createPost);

// Request Structure for Create Post:
// - Method: POST /api/posts
// - Headers: Authorization: Bearer <jwt_token> (required)
// - Body (JSON): 
//   {
//     "title": "string (required)",
//     "description": "string (required)",
//     "category": "string enum (required)",
//     "tags": ["string"] (optional array),
//     "type": "string enum (required)",
//     "price": number (optional, default 0),
//     "location": "string" (optional),
//     "details": {} (optional object),
//     "images": ["url"] (optional array)
//   }
// Response Structure:
// - Success (201): { "message": "string", "post": { post object without __v } }
// - Errors: 400 { "message": "validation error" }, 401 { "message": "unauthorized" }, 500 { "message": "server error" }

// Get my posts (authenticated user, optional status filter)
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