const Joi = require('joi');
const Post = require('../../models/Post.js');

// Query validation for my-posts (status filter, pagination)
const querySchema = Joi.object({
  status: Joi.string().valid('Pending Approval', 'Published', 'Rejected').allow('').optional(), // Allow empty for no filter
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const getMyPosts = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const userID = req.user._id;
    const skip = (page - 1) * limit;

    // Build query: always filter by userID, optional status (skip if empty)
    const query = { userID };
    if (status && status !== '') {
      query.status = status;
    }

    // Fetch posts with pagination, sort by createdAt desc
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Lean for faster queries (plain JS objects)

    // Total count for pagination
    const total = await Post.countDocuments(query);

    res.status(200).json({
      message: 'User posts retrieved successfully',
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({ message: 'Server error during fetching posts' });
  }
};

module.exports = { getMyPosts };