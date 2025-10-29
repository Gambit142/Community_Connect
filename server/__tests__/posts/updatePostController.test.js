const Post = require('../../src/models/Post.js');
const Notification = require('../../src/models/Notification.js');
const nodemailer = require('nodemailer');
const User = require('../../src/models/User.js');
const { cloudinary } = require('../../src/config/cloudinary.js');
const mongoose = require('mongoose');

// --- Global Mocks Setup (Must be before controller import) ---

// Mock Socket.IO
const mockIoEmit = jest.fn();
const mockIoTo = jest.fn(() => ({ emit: mockIoEmit })); 
global.io = {
  to: mockIoTo,
};

// Mock Nodemailer
const mockSendMail = jest.fn().mockResolvedValue({ response: '250 OK' });
nodemailer.createTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail });

// Mock Cloudinary Uploader Stream (for image uploads)
const mockUploaderStream = {
  // This needs to return itself for the .end() call to work
  end: jest.fn(),
};
cloudinary.uploader = {
  upload_stream: jest.fn((options, callback) => {
    // Simulate successful upload and pass secure_url to callback
    const mockSecureUrl = `http://res.cloudinary.com/test/image/${Date.now()}`;
    // Use process.nextTick to simulate the stream operation being async
    process.nextTick(() => callback(null, { secure_url: mockSecureUrl }));
    return mockUploaderStream;
  }),
};

// Mock Mongoose models before controller import
jest.mock('../../src/models/Post.js');
jest.mock('../../src/models/Notification.js');
jest.mock('../../src/models/User.js');

// Import the controller AFTER all mocks are set up
const { updatePost } = require('../../src/controllers/posts/updatePostController.js');

describe('Update Post Controller', () => {
  let req, res;
  const mockPostId = '507f1f77bcf86cd799439011';
  const mockUserId = '607f1f77bcf86cd799439011';
  const mockUsername = 'testuser';
  const mockUserEmail = 'test@example.com';
  const mockAdminId = '707f1f77bcf86cd799439011';
  
  // Define mock for the instance method (save) outside the constructor
  let mockNewPostSave;

  const mockUser = {
    _id: mockUserId,
    username: mockUsername,
    email: mockUserEmail,
    role: 'member',
  };

  const mockPublishedPost = {
    _id: mockPostId,
    title: 'Original Title',
    category: 'food',
    status: 'Published',
    userID: mockUserId,
    images: ['old_image_url'],
    toObject: jest.fn(() => ({ ...mockPublishedPost, userID: mockUserId.toString() })),
  };

  const mockRejectedPost = {
    _id: mockPostId,
    title: 'Rejected Title',
    category: 'food',
    status: 'Rejected',
    rejectionReason: 'Test reason',
    userID: mockUserId,
    images: [],
    toObject: jest.fn(() => ({ ...mockRejectedPost, userID: mockUserId.toString() })),
  };

  const mockNewPost = {
    _id: new mongoose.Types.ObjectId(),
    title: 'Resubmitted Title',
    category: 'food',
    status: 'Pending Approval',
    userID: mockUserId,
    type: 'donation',
    originalPostId: mockPostId,
    price: 0,
    location: 'Test location',
    details: {},
    images: [],
  };

  beforeEach(() => {
    req = {
      params: { id: mockPostId },
      user: mockUser,
      body: {},
      files: [],  // Default no files
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.clearAllMocks(); 

    // Reset instance save mock
    mockNewPostSave = jest.fn().mockResolvedValue(mockNewPost || { _id: new mongoose.Types.ObjectId(), status: 'Pending Approval' });

    // Ensure core mocks are reset (helps with chain mocks)
    Post.findOne.mockReset();
    Post.findOneAndUpdate.mockReset();
    Post.findByIdAndUpdate.mockReset();
    User.find.mockReset();
    Notification.insertMany.mockReset();
  });

  // Helper to mock User.find with proper chaining for admin queries
  const mockUserFindForAdmins = () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      then: jest.fn((resolve) => resolve([{ _id: mockAdminId }])),
      catch: jest.fn(),
    };
    User.find.mockReturnValue(mockQuery);
  };

  // --- Success Tests ---

  it('should update a published post and set status to Pending Approval', async () => {
    const mockUpdatedDoc = {
      _id: mockPostId,
      title: 'Updated Title',
      description: 'Updated desc',
      category: 'food',
      status: 'Published',  // Starts as Published (status not in updates)
      userID: mockUserId,
      type: 'donation',
      price: 0,
      location: 'Test location',
      details: {},
      images: ['old_image_url'],
    };

    req.body = { title: 'Updated Title', description: 'Updated desc' };

    // Mock existing post
    Post.findOne.mockResolvedValue(mockPublishedPost);

    // Mock for chain: findOneAndUpdate returns query, lean returns promise to doc
    const mockUpdateQuery = {
      lean: jest.fn().mockReturnValue(Promise.resolve(mockUpdatedDoc)),
    };
    Post.findOneAndUpdate.mockReturnValue(mockUpdateQuery);

    // Mock status update
    Post.findByIdAndUpdate.mockResolvedValue(mockUpdatedDoc);

    // Mock admins with proper chain
    mockUserFindForAdmins();

    // Mock notifications
    Notification.insertMany.mockResolvedValue([]);

    await updatePost(req, res);

    // Check post update (status remains Published in initial update, but set to Pending after)
    expect(Post.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockPostId, userID: mockUserId },
      { $set: { title: 'Updated Title', description: 'Updated desc' } },
      { new: true, runValidators: true }
    );

    // Check status override to Pending
    expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(mockPostId, { status: 'Pending Approval' });

    // Check admin notifications triggered
    expect(User.find).toHaveBeenCalledWith({ role: 'admin' });
    expect(Notification.insertMany).toHaveBeenCalled();  
    expect(global.io.to).toHaveBeenCalledWith('role-admin');

    // Check response with Pending status
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post updated successfully',
        post: expect.objectContaining({ status: 'Pending Approval' }),
      })
    );
  });

  it('should resubmit a rejected post as a new pending post and archive the old one', async () => {
    req.body = { title: 'Resubmitted Title' };

    // Mock existing rejected post
    Post.findOne.mockResolvedValue(mockRejectedPost);

    // Mock constructor for new Post (provides save method)
    const originalPost = Post;
    Post.mockImplementation(() => ({
      save: mockNewPostSave,  // Resolves to saved post
    }));

    // Mock archiving
    Post.findByIdAndUpdate.mockResolvedValue({});

    // Mock admins with proper chain
    mockUserFindForAdmins();

    // Mock notifications
    Notification.insertMany.mockResolvedValue([]);

    await updatePost(req, res);

    // Restore original if needed, but since per test, ok
    Post.mockImplementation(originalPost);

    // Check new post creation and save called
    expect(mockNewPostSave).toHaveBeenCalled();  

    // Check archiving of old post
    expect(Post.findByIdAndUpdate).toHaveBeenCalledWith(mockPostId, { status: 'Archived' });

    // Check admin notifications with resubmission message
    expect(Notification.insertMany).toHaveBeenCalled();
    expect(global.io.to).toHaveBeenCalledWith('role-admin');

    // Check response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post resubmitted successfully and pending approval',
        post: expect.objectContaining({ status: 'Pending Approval', originalPostId: mockPostId }),
      })
    );
  });

  it('should upload new images and attach secure URLs to the updates', async () => {
    // Mock files (2 images)
    const mockFiles = [
      { buffer: Buffer.from('fake image data'), mimetype: 'image/jpeg' },
      { buffer: Buffer.from('fake image data 2'), mimetype: 'image/png' },
    ];
    req.files = mockFiles;
    req.body = { title: 'Title with Images' };

    const mockUpdatedDoc = {
      _id: mockPostId,
      title: 'Title with Images',
      category: 'food',
      status: 'Published',  // Will be set to Pending
      userID: mockUserId,
      type: 'donation',
      price: 0,
      location: '',
      details: {},
      images: [],  // Assume replace, or adjust if append
    };

    // Mock existing post (set images empty if replace)
    mockPublishedPost.images = [];
    Post.findOne.mockResolvedValue(mockPublishedPost);

    // Mock for chain
    const mockUpdateQuery = {
      lean: jest.fn().mockReturnValue(Promise.resolve(mockUpdatedDoc)),
    };
    Post.findOneAndUpdate.mockReturnValue(mockUpdateQuery);

    // Mock status update
    Post.findByIdAndUpdate.mockResolvedValue(mockUpdatedDoc);

    // Mock admins with proper chain
    mockUserFindForAdmins();

    // Mock notifications
    Notification.insertMany.mockResolvedValue([]);

    await updatePost(req, res);

    // Drain microtasks for cloudinary callbacks
    await new Promise(resolve => process.nextTick(resolve));
    await new Promise(resolve => process.nextTick(resolve));

    // 1. Check Cloudinary upload calls
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2);
    expect(mockUploaderStream.end).toHaveBeenCalledTimes(2);

    // 2. Check Post Update data (images array should contain new URLs)
    const updateArg = Post.findOneAndUpdate.mock.calls[0][1]['$set'];
    expect(updateArg.images.length).toBe(2);
    expect(updateArg.images[0]).toContain('http://res.cloudinary.com/test/image/');

    // 3. Check Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post updated successfully',
        post: expect.objectContaining({ status: 'Pending Approval' }),
      })
    );

    // Check notifications triggered
    expect(Notification.insertMany).toHaveBeenCalled();
  });

  // --- Edge Case / Error Tests ---

  it('should return 400 for invalid JSON in details field', async () => {
    req.body = { details: '{"key": "value",}' }; 
    
    // Mock existing post to reach the parse step
    Post.findOne.mockResolvedValue(mockPublishedPost);

    await updatePost(req, res);

    expect(Post.findOneAndUpdate).not.toHaveBeenCalled();
    expect(Post).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Invalid JSON in details'),
      })
    );
  });

  it('should return 400 for Joi validation failure (e.g., max length)', async () => {
    req.body = { title: 'A'.repeat(201) };
    
    await updatePost(req, res);

    expect(Post.findOne).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Title too long'),
      })
    );
  });
  
  it('should return 404 if post not found or user does not own it', async () => {
    Post.findOne.mockResolvedValue(null);

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Post not found or you do not own this post',
      })
    );
  });

  it('should handle general server error', async () => {
    Post.findOne.mockRejectedValue(new Error('General server error'));

    await updatePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error during post update',
      })
    );
  });
});