const { deleteFlaggedComment } = require('../../utils/admin/flaggedCommentsService.js');

const deleteFlaggedCommentController = async (req, res) => {
  try {
    const { commentId } = req.params;
    const result = await deleteFlaggedComment(commentId, req.user._id.toString());
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete flagged comment error:', error);
    res.status(error.message.includes('not found') ? 404 : 400).json({ message: error.message });
  }
};

module.exports = { deleteFlaggedCommentController };