const Post = require('../../src/models/Post.js');
const Notification = require('../../src/models/Notification.js');
const nodemailer = require('nodemailer');

// FIX 1: Define global.io mocks before controller import for robustness
const mockIoEmit = jest.fn();
// mockIoTo is the spy for global.io.to()
const mockIoTo = jest.fn(() => ({ emit: mockIoEmit })); 
global.io = {
  to: mockIoTo,
};

// FIX 2: Define nodemailer mock implementation BEFORE controller is imported
// mockSendMail is the spy for transporter.sendMail()
const mockSendMail = jest.fn().mockResolvedValue({ response: '250 OK' });
nodemailer.createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

// Import the controller AFTER all global/external mocks are set up
const { rejectPost } = require('../../src/controllers/admin/rejectPostController.js');

// Mock Mongoose models (safe to do here)
jest.mock('../../src/models/Post.js');
jest.mock('../../src/models/Notification.js');


describe('Reject Post Controller', () => {
  let req, res;
  const mockPostId = '507f1f77bcf86cd799439011';
  const mockUserId = '607f1f77bcf86cd799439011';
  const mockReason = 'This post violates guideline X by being too general.';

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
      body: { reason: mockReason },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Clear mocks before each test to ensure accurate call counts
    jest.clearAllMocks(); 

    // Mock the populate chain for findOneAndUpdate
    Post.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        ...mockPostData,
        status: 'Rejected', // State after update
        rejectionReason: mockReason,
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

  it('should successfully reject a pending post and send notifications', async () => {
    await rejectPost(req, res);

    // 1. Check Post Update
    expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockPostId, status: 'Pending Approval' },
      { status: 'Rejected', rejectionReason: mockReason },
      { new: true }
    );
    expect(Post.findOneAndUpdate().populate).toHaveBeenCalledWith('userID', 'username email');

    // 2. Check Notification Creation
    expect(Notification.prototype.save).toHaveBeenCalled();
    expect(Notification).toHaveBeenCalledWith(
      expect.objectContaining({
        userID: mockUserId,
        type: 'post_status',
        message: expect.stringContaining(mockReason),
      })
    );

    // 3. Check Socket Emission (Checks the local mockIoTo spy)
    expect(mockIoTo).toHaveBeenCalledWith(`user-${mockUserId}`);
    expect(mockIoEmit).toHaveBeenCalledWith('newNotification', expect.any(Object));

    // 4. Check Email Sending (Checks the local mockSendMail spy)
    expect(mockSendMail).toHaveBeenCalled();
    expect(mockSendMail.mock.calls[0][0].to).toBe(mockPostData.userID.email);
    expect(mockSendMail.mock.calls[0][0].subject).toContain('Post Rejected');
    expect(mockSendMail.mock.calls[0][0].html).toContain(`<strong>Reason:</strong> ${mockReason}`);

    // 5. Check Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post rejected successfully',
        post: expect.objectContaining({ status: 'Rejected', rejectionReason: mockReason }),
      })
    );
  });

  it('should return 400 if rejection reason is missing', async () => {
    req.body.reason = '';

    await rejectPost(req, res);

    expect(Post.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Rejection reason must be at least 10 characters',
      })
    );
  });

  it('should return 400 if rejection reason is too short', async () => {
    req.body.reason = 'Too short';

    await rejectPost(req, res);

    expect(Post.findOneAndUpdate).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Rejection reason must be at least 10 characters',
      })
    );
  });

  it('should return 404 if post not found or already processed', async () => {
    Post.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await rejectPost(req, res);

    expect(Post.findOneAndUpdate).toHaveBeenCalled();
    expect(Notification.prototype.save).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post not found or already processed',
      })
    );
  });

  it('should handle server error during rejection', async () => {
    Post.findOneAndUpdate.mockImplementation(() => {
      throw new Error('DB error');
    });

    await rejectPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error during rejection',
      })
    );
  });
});
