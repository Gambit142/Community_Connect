const Joi = require('joi');
const Post = require('../../models/Post.js');

// Query validation for public posts (search, category, tags, location, pagination)
const querySchema = Joi.object({
  search: Joi.string().allow('').optional(), // Search title/description/location
  category: Joi.string().valid('food', 'tutoring', 'ridesharing', 'housing', 'jobs', 'health', 'education', 'goods', 'events', 'transportation', 'financial').allow('').optional(),
  tags: Joi.string().allow('').optional(), // Comma-separated tags
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(12).default(6), // 6 per page
});

const getPosts = async (req, res) => {
  try {
    const { error } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { search, category, tags, page = 1, limit = 6 } = req.query;
    const skip = (page - 1) * limit;

    // Build query: only published posts
    let query = { status: 'Published' };

    // Category filter
    if (category && category !== '') {
      query.category = category;
    }

    // Search: text index on title/description/location (add index in schema if not)
    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Tags filter (all must match if provided)
    if (tags && tags !== '') {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $all: tagArray };
    }

    // Fetch with pagination, sort by createdAt desc
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-userID') // Hide userID for public view
      .lean();

    // Total count
    const total = await Post.countDocuments(query);

    res.status(200).json({
      message: 'Posts retrieved successfully',
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPosts: total,
        hasNext: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error during fetching posts' });
  }
};

module.exports = { getPosts };