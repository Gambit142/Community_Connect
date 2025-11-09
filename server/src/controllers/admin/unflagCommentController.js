const { unflagComment } = require('../../utils/admin/flaggedCommentsService.js');

const unflagCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const updated = await unflagComment(commentId, req.user._id.toString());
    res.status(200).json({ message: 'Comment approved/unflagged successfully', comment: updated.toObject() });
  } catch (error) {
    console.error('Unflag comment error:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ message: error.message });
  }
};

module.exports = { unflagCommentController };