const { getFlaggedComments } = require('../../utils/comments/service.js');

const getFlaggedCommentsController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { comments, pagination } = await getFlaggedComments(parseInt(page), parseInt(limit));
    res.status(200).json({ message: 'Flagged comments retrieved successfully', comments, pagination });
  } catch (error) {
    console.error('Get flagged comments error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { getFlaggedCommentsController };