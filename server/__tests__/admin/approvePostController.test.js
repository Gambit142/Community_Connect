const Post = require('../../src/models/Post.js');
const Notification = require('../../src/models/Notification.js');
const nodemailer = require('nodemailer');

// FIX 1: Define global.io mocks before controller import for robustness
const mockIoEmit = jest.fn();
const mockIoTo = jest.fn(() => ({ emit: mockIoEmit }));
global.io = {
  to: mockIoTo,
};
// FIX 2: Define nodemailer mock implementation BEFORE controller is imported
const mockSendMail = jest.fn().mockResolvedValue({ response: '250 OK' });
nodemailer.createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

// Import the controller AFTER all global mocks are set up
const { approvePost } = require('../../src/controllers/admin/approvePostController.js');

// Mock external dependencies
jest.mock('../../src/models/Post.js');
jest.mock('../../src/models/Notification.js');
jest.mock('nodemailer');


describe('Approve Post Controller', () => {
  let req, res;
  const mockPostId = '507f1f77bcf86cd799439011';
  const mockUserId = '607f1f77bcf86cd799439011';

  const mockPostData = {
    _id: mockPostId,
    title: 'Pending Food Post',
    category: 'food',
    userID: { _id: mockUserId, username: 'TestUser', email: 'test@example.com' },
    status: 'Pending Approval',
  };

  beforeEach(() => {
    req = {
      params: { id: mockPostId },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks(); // Resets call counts on all mocks including io spies

    // Mock the populate chain for findOneAndUpdate
    Post.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        ...mockPostData,
        status: 'Published', // State after update
      }),
    });
    
    // Mock Notification save method
    Notification.prototype.save = jest.fn().mockResolvedValue({
      userID: mockUserId,
      message: 'Notification message',
    });
  });

  afterEach(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  it('should successfully approve a pending post and send notifications', async () => {
    await approvePost(req, res);

    // 1. Check Post Update
    expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockPostId, status: 'Pending Approval' },
      { status: 'Published' },
      { new: true }
    );
    expect(Post.findOneAndUpdate().populate).toHaveBeenCalledWith('userID', 'username email');

    // 2. Check Notification Creation
    expect(Notification.prototype.save).toHaveBeenCalled();
    expect(Notification).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockUserId,
        type: 'post_status',
      })
    );

    // 3. Check Socket Emission
    expect(mockIoTo).toHaveBeenCalledWith(`user-${mockUserId}`);
    expect(mockIoEmit).toHaveBeenCalledWith('newNotification', expect.any(Object));

    // 4. Check Email Sending (Failure point is fixed by loading the mock early)
    expect(mockSendMail).toHaveBeenCalled();
    expect(mockSendMail.mock.calls[0][0].to).toBe(mockPostData.userID.email);
    expect(mockSendMail.mock.calls[0][0].subject).toContain('Post Approved');

    // 5. Check Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post approved successfully',
        post: expect.objectContaining({ status: 'Published' }),
      })
    );
  });

  it('should return 404 if post not found or already processed', async () => {
    Post.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await approvePost(req, res);

    expect(Post.findOneAndUpdate).toHaveBeenCalled();
    expect(mockIoTo).not.toHaveBeenCalled(); 
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post not found or already processed',
      })
    );
  });

  it('should handle server error during approval', async () => {
    Post.findOneAndUpdate.mockImplementation(() => {
      throw new Error('DB error');
    });

    await approvePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error during approval',
      })
    );
  });
});
