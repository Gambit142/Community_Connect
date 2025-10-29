const Post = require('../../src/models/Post.js');
const nodemailer = require('nodemailer');

// Define nodemailer mock implementation BEFORE controller is imported
const mockSendMail = jest.fn().mockResolvedValue({ response: '250 OK' });
nodemailer.createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

// Import the controller AFTER nodemailer mock is set up
const { deletePost } = require('../../src/controllers/posts/deletePostController.js');

// Mock Mongoose models
jest.mock('../../src/models/Post.js');

describe('Delete Post Controller', () => {
  let req, res;
  const mockPostId = '507f1f77bcf86cd799439011';
  const mockUserId = '607f1f77bcf86cd799439011';
  const mockUsername = 'testuser';
  const mockUserEmail = 'test@example.com';

  const mockExistingPost = {
    _id: mockPostId,
    title: 'Post to be deleted',
    userID: mockUserId,
  };

  beforeEach(() => {
    req = {
      params: { id: mockPostId },
      user: { _id: mockUserId, username: mockUsername, email: mockUserEmail },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks();

    Post.findOne.mockResolvedValue(mockExistingPost);
    Post.findByIdAndDelete.mockResolvedValue(true); 
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  it('should successfully delete the post and send a confirmation email', async () => {
    await deletePost(req, res);

    // 1. Check ownership and post existence
    expect(Post.findOne).toHaveBeenCalledWith({ _id: mockPostId, userID: mockUserId });

    // 2. Check deletion
    expect(Post.findByIdAndDelete).toHaveBeenCalledWith(mockPostId);

    // 3. Check Email Sending
    expect(mockSendMail).toHaveBeenCalled();
    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.to).toBe(mockUserEmail);
    expect(mailOptions.subject).toContain('Post Deleted');
    expect(mailOptions.html).toContain(mockExistingPost.title);

    // 4. Check Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post deleted successfully',
    });
  });

  it('should return 404 if post is not found or user does not own it', async () => {
    // Case 1: Post not found
    Post.findOne.mockResolvedValue(null);

    await deletePost(req, res);

    expect(Post.findOne).toHaveBeenCalledWith({ _id: mockPostId, userID: mockUserId });
    expect(Post.findByIdAndDelete).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post not found or you do not own this post',
    });
  });

  it('should handle server error during post deletion', async () => {
    Post.findOne.mockRejectedValue(new Error('DB error'));

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Server error during post deletion',
    });
  });
});
