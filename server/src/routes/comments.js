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

// Flat routes example (POST /api/comments with body including relatedType/relatedId)
// For create: adjust service to use req.body.relatedType if no params
router.post('/', authenticateToken, (req, res) => {
  const { relatedType, relatedId } = req.body;
  if (!relatedType || !relatedId) return res.status(400).json({ message: 'relatedType and relatedId required' });
  createCommentGeneric(req, res, relatedType, relatedId);
});
router.get('/:relatedType/:relatedId', getCommentsGeneric);
router.put('/:commentId', authenticateToken, (req, res, next) => updateCommentGeneric(req, res, req.params.commentId));
router.delete('/:commentId', authenticateToken, (req, res, next) => deleteCommentGeneric(req, res, req.params.commentId));
router.post('/:commentId/like', authenticateToken, (req, res, next) => toggleCommentLikeGeneric(req, res, req.params.commentId));
router.post('/:relatedType/:relatedId/:commentId/flag', authenticateToken, (req, res) => flagCommentGeneric(req, res, req.params.relatedType, req.params.relatedId, req.params.commentId));

module.exports = router;