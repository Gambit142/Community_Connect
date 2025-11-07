const { 
  createComment, 
  getCommentsTree, 
  updateComment, 
  deleteComment, 
  toggleCommentLike, 
  flagComment,
  toggleResourceLike 
} = require('../utils/comments/service.js');

const createCommentGeneric = async (req, res, relatedType, relatedId) => {
  try {
    const comment = await createComment(req.user, relatedType, relatedId, req.body);
    res.status(201).json({ message: 'Comment created successfully', comment: comment.toObject() });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(error.message.includes('Unauthorized') ? 403 : 400).json({ message: error.message });
  }
};

const getCommentsGeneric = async (req, res, relatedType, relatedId) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user ? req.user._id.toString() : null;
    const { comments, pagination } = await getCommentsTree(relatedType, relatedId, { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      userId 
    });
    res.status(200).json({ message: 'Comments retrieved successfully', comments, pagination });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ message: error.message || 'Server error' });
  }
};

const updateCommentGeneric = async (req, res, commentId) => {
  try {
    const updated = await updateComment(commentId, req.user._id.toString(), req.body);
    res.status(200).json({ message: 'Comment updated successfully', comment: updated.toObject() });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(error.message.includes('Unauthorized') ? 403 : 400).json({ message: error.message });
  }
};

const deleteCommentGeneric = async (req, res, commentId) => {
  try {
    await deleteComment(commentId, req.user._id.toString());
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(error.message.includes('Unauthorized') ? 403 : 400).json({ message: error.message });
  }
};

const toggleCommentLikeGeneric = async (req, res, commentId) => {
  try {
    const { liked, likeCount } = await toggleCommentLike(commentId, req.user._id.toString());
    res.status(200).json({ message: 'Like toggled successfully', liked, likeCount });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(400).json({ message: error.message });
  }
};

const flagCommentGeneric = async (req, res, relatedType, relatedId, commentId) => {
  try {
    await flagComment(commentId, req.user._id.toString(), req.user.username, relatedType, relatedId);
    res.status(200).json({ message: 'Comment flagged successfully' });
  } catch (error) {
    console.error('Flag comment error:', error);
    res.status(error.message.includes('Already') ? 400 : 403).json({ message: error.message });
  }
};

const toggleResourceLikeGeneric = async (req, res, relatedType, relatedId) => {
  try {
    const { liked, likeCount } = await toggleResourceLike(relatedType, relatedId, req.user._id.toString());
    res.status(200).json({ message: 'Like toggled successfully', liked, likeCount });
  } catch (error) {
    console.error('Toggle resource like error:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createCommentGeneric,
  getCommentsGeneric,
  updateCommentGeneric,
  deleteCommentGeneric,
  toggleCommentLikeGeneric,
  flagCommentGeneric,
  toggleResourceLikeGeneric,
};