const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const { uploadMiddleware } = require('../middleware/multerConfig.js');
const { createPost } = require('../controllers/posts/createPostController.js');
const { updatePost } = require('../controllers/posts/updatePostController.js');
const { deletePost } = require('../controllers/posts/deletePostController.js');
const { getMyPosts } = require('../controllers/posts/getMyPostsController.js');
const { getPosts } = require('../controllers/posts/postsController.js');
const { getPostById, getSimilarPosts } = require('../controllers/posts/getPostController.js');
const { toggleResourceLikeGeneric } = require('../controllers/commentsController.js');

// Create post (member only, pending approval) with image upload (up to 5 images)
router.post('/', authenticateToken, uploadMiddleware, createPost);

// Update post (member only, ownership check)
router.put('/:id', authenticateToken, uploadMiddleware, updatePost);

// Delete post (member only, ownership check)
router.delete('/:id', authenticateToken, deletePost);

// Get my posts
router.get('/my-posts', authenticateToken, getMyPosts);

// Get all published posts (public, with filters/search/pagination)
router.get('/', getPosts);

// Get single post by ID (public, only published posts)
router.get('/:id', getPostById);

// Get similar posts (public, based on category, exclude current post)
router.get('/:id/similar', getSimilarPosts);

// Like post (toggle)
router.post('/:id/like', authenticateToken, (req, res) => toggleResourceLikeGeneric(req, res, 'post', req.params.id));

module.exports = router;