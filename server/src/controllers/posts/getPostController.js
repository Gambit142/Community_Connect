const Post = require('../../models/Post.js');
const jwt = require('jsonwebtoken');

// Get single post by ID (public for published, auth+owner/admin for others)
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    // Basic ID validation (MongoDB ObjectId format)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid post ID format' });
    }

    // Manually decode token if present (for optional auth)
    let decodedUser = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        console.error('Token verification error:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    // Fetch full post
    const fullPost = await Post.findOne({ _id: id });
    if (!fullPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If published, anyone can view
    if (fullPost.status === 'Published') {
      const post = fullPost.toObject();
      delete post.userID;
      return res.status(200).json({
        message: 'Post retrieved successfully',
        post,
      });
    }

    // For unpublished, require auth and check ownership or admin role
    if (!decodedUser) {
      return res.status(401).json({ message: 'Authentication required to view unpublished post' });
    }

    // Safely check ownership (use 'id' from JWT payload)
    const userIdStr = fullPost.userID ? fullPost.userID.toString() : null;
    if (userIdStr !== decodedUser.id.toString() && decodedUser.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to view this post' });
    }

    // Authorized, return post without userID
    const post = fullPost.toObject();
    delete post.userID;

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