const Post = require('../../models/Post.js');
const { sendEmail } = require('../../utils/emailService.js'); 

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and check ownership
    const post = await Post.findOne({ _id: id, userID: req.user._id });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or you do not own this post' });
    }

    // Delete post
    await Post.findByIdAndDelete(id);

    // Use centralized sendEmail (fire-and-forget)
    sendEmail({
      to: req.user.email,
      subject: 'Post Deleted - Community Connect',
      html: `
        <h1>Your Post Has Been Deleted</h1>
        <p>Dear ${req.user.username},</p>
        <p>Your post "<strong>${post.title}</strong>" has been deleted successfully.</p>
        <p>If this was a mistake, you can create a new post anytime.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/posts/create" style="background-color: #05213C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Create New Post</a>
        <p>Best regards,<br>Community Connect Team</p>
      `,
    });

    res.status(200).json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error during post deletion' });
  }
};

module.exports = { deletePost };