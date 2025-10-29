const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { uploadMiddleware } = require('../middleware/multerConfig.js'); // Import from middleware
const { createPost } = require('../controllers/posts/createPostController.js');
const { updatePost } = require('../controllers/posts/updatePostController.js');
const { deletePost } = require('../controllers/posts/deletePostController.js');
const { getMyPosts } = require('../controllers/posts/getMyPostsController.js');
const { getPosts } = require('../controllers/posts/postsController.js');
const { getPostById, getSimilarPosts } = require('../controllers/posts/getPostController.js'); // New import

// Create post (member only, pending approval) with image upload (up to 5 images)
router.post('/', authenticateToken, uploadMiddleware, createPost);

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

// Update post (member only, ownership check)
router.put('/:id', authenticateToken, uploadMiddleware, updatePost);

// Delete post (member only, ownership check)
router.delete('/:id', authenticateToken, deletePost);

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

// Get all published posts (public, with filters/search/pagination)
router.get('/', getPosts);

// Request Structure for Get All Posts:
// - Method: GET /api/posts
// - Query Params: 
//   ?search=query (title/description/location, optional)
//   ?category=food (filter, optional)
//   ?tags=free,urgent (comma-separated, optional)
//   ?page=1 (optional, default 1)
//   ?limit=6 (optional, default 6, max 12)
// Response Structure:
// - Success (200): { "message": "string", "posts": [post objects], "pagination": { currentPage, totalPages, totalPosts, hasNext } }
// - Errors: 400 { "message": "validation error" }, 500 { "message": "server error" }

// Get single post by ID (public, only published posts)
router.get('/:id', getPostById);

// Request Structure for Get Post by ID:
// - Method: GET /api/posts/:id
// - No body/headers required
// Response Structure:
// - Success (200): { "message": "string", "post": { ...post object } }
// - Errors: 404 { "message": "Post not found" }, 500 { "message": "server error" }

// Get similar posts (public, based on category, exclude current post)
router.get('/:id/similar', getSimilarPosts);

// Request Structure for Get Similar Posts:
// - Method: GET /api/posts/:id/similar
// - No body/headers required
// Response Structure:
// - Success (200): { "message": "string", "similarPosts": [post objects, max 5] }
// - Errors: 404 { "message": "Post not found" }, 500 { "message": "server error" }

module.exports = router;