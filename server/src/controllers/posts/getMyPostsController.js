const Joi = require('joi');
const Post = require('../../models/Post.js');

// Query validation for my posts (status, page, limit)
const querySchema = Joi.object({
  status: Joi.string().valid('Pending Approval', 'Published', 'Rejected').allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const getMyPosts = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const userID = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query: user's posts only
    let query = { userID };

    // Status filter
    if (status && status !== '') {
      query.status = status;
    }

    // Fetch posts
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Total count
    const total = await Post.countDocuments(query);

    res.status(200).json({
      message: 'Your posts retrieved successfully',
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
    res.status(500).json({ message: 'Server error during fetching your posts' });
  }
};

module.exports = { getMyPosts };