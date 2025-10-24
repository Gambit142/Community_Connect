const Post = require('../../models/Post.js');
const Joi = require('joi');

// Validation schema for query params (search, page, limit)
const querySchema = Joi.object({
  search: Joi.string().allow('').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(20).default(10),
});

const getPendingPosts = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query: only pending posts
    let query = { status: 'Pending Approval' };

    // Search in title/description
    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch posts populated with user (for author info)
    const posts = await Post.find(query)
      .populate('userID', 'username email') // Basic user info
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Total count
    const total = await Post.countDocuments(query);

    res.status(200).json({
      message: 'Pending posts retrieved successfully',
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Get pending posts error:', error);
    res.status(500).json({ message: 'Server error during fetching pending posts' });
  }
};

module.exports = { getPendingPosts };