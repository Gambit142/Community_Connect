const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.js');
const {
  createCommentGeneric,
  getCommentsGeneric,
  updateCommentGeneric,
  deleteCommentGeneric,
  toggleCommentLikeGeneric,
  flagCommentGeneric,
} = require('../controllers/commentsController.js');

// Create comment for specific resource
router.post('/:relatedType/:relatedId', authenticateToken, (req, res) => {
  createCommentGeneric(req, res, req.params.relatedType, req.params.relatedId);
});

// Get comments for specific resource
router.get('/:relatedType/:relatedId', (req, res) => {
  getCommentsGeneric(req, res, req.params.relatedType, req.params.relatedId);
});

// Update comment
router.put('/:commentId', authenticateToken, (req, res) => 
  updateCommentGeneric(req, res, req.params.commentId)
);

// Delete comment
router.delete('/:commentId', authenticateToken, (req, res) => 
  deleteCommentGeneric(req, res, req.params.commentId)
);

// Like comment
router.post('/:commentId/like', authenticateToken, (req, res) => 
  toggleCommentLikeGeneric(req, res, req.params.commentId)
);

// Flag comment
router.post('/:relatedType/:relatedId/:commentId/flag', authenticateToken, (req, res) => 
  flagCommentGeneric(req, res, req.params.relatedType, req.params.relatedId, req.params.commentId)
);

module.exports = router;