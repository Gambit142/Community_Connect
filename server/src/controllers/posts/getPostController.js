const Post = require('../../models/Post.js');

// Get single post by ID (public, only published)
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ID validation (MongoDB ObjectId format)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // Fetch post
    const post = await Post.findOne({ _id: id, status: 'Published' })
      .select('-userID') // Hide userID for public view
      .lean();

    if (!post) {
      return res.status(404).json({ message: 'Post not found or not published' });
    }

    res.status(200).json({
      message: 'Post retrieved successfully',
      post,
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Server error during fetching post' });
  }
};

// Get similar posts (public, based on category, exclude current ID)
const getSimilarPosts = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ID validation
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // First, get the current post's category
    const currentPost = await Post.findOne({ _id: id, status: 'Published' }).select('category').lean();
    if (!currentPost) {
      return res.status(404).json({ message: 'Post not found or not published' });
    }

    // Fetch similar posts: same category, exclude current ID, published only
    const similarPosts = await Post.find({
      category: currentPost.category,
      _id: { $ne: id },
      status: 'Published',
    })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(5) // Max 5
      .select('-userID') // Hide userID
      .lean();

    res.status(200).json({
      message: 'Similar posts retrieved successfully',
      similarPosts,
    });
  } catch (error) {
    console.error('Get similar posts error:', error);
    res.status(500).json({ message: 'Server error during fetching similar posts' });
  }
};

module.exports = { getPostById, getSimilarPosts };