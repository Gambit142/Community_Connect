const request = require('supertest');
const { app } = require('../../src/index.js');
const mongoose = require('mongoose');
const Post = require('../../src/models/Post.js');
const User = require('../../src/models/User.js');
const Notification = require('../../src/models/Notification.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer', () => {
  const mockTransporter = {
    verify: jest.fn().mockResolvedValue(true),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' }),
  };
  return {
    createTransport: jest.fn().mockReturnValue(mockTransporter),
  };
});

// Mock cloudinary properly (self-contained factory to avoid init error)
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, cb) => {
        // Create mock stream inside factory
        const { Writable } = require('stream');
        const mockStream = new Writable({
          write() { return true; }
        });
        mockStream.end = jest.fn((buffer) => {
          // Simulate successful upload after .end() is called
          process.nextTick(() => cb(null, { secure_url: `https://res.cloudinary.com/mock/image_${Date.now()}.jpg` }));
        });
        return mockStream;
      }),
    },
  },
}));

// Mock socket.io init with closure for singleton
jest.mock('../../src/config/socket.js', () => {
  let mockIo;
  const initSocket = jest.fn(() => {
    if (!mockIo) {
      mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      };
    }
    return mockIo;
  });
  return { initSocket };
});

// Global setup for MongoDB connection
beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST;
  if (!uri) {
    throw new Error('MONGO_URI_TEST is not defined in .env');
  }
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Post Creation Endpoint', () => {
  let testUser;
  let authToken;
  let adminUser;
  let mockIo;

  beforeEach(async () => {
    // Clean up data
    await Post.deleteMany({});
    await User.deleteMany({});
    await Notification.deleteMany({});

    // Reset mocks
    jest.clearAllMocks();

    // Get the mock io instance
    const { initSocket } = require('../../src/config/socket.js');
    mockIo = initSocket();

    // Create a test user (member)
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'member',
      isVerified: true,
      userType: 'individual', // Required per schema
    });
    await testUser.save();

    // Create an admin user for notifications
    const adminPassword = 'admin123';
    const adminSalt = await bcrypt.genSalt(10);
    const adminHashedPassword = await bcrypt.hash(adminPassword, adminSalt);

    adminUser = new User({
      username: 'adminuser',
      email: 'admin@example.com',
      passwordHash: adminHashedPassword,
      role: 'admin',
      isVerified: true,
      userType: 'individual', // Required per schema
    });
    await adminUser.save();

    // Generate JWT token for test user
    authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET || 'test_secret');
  }, 10000);

  describe('Validation and Input Handling', () => {
    it('should fail validation if title is missing', async () => {
      const postData = {
        description: 'Test description',
        category: 'food',
        type: 'donation',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('"title" is required'); // Matches Joi default for missing field
    });

    it('should fail validation if description is missing', async () => {
      const postData = {
        title: 'Test title',
        category: 'food',
        type: 'donation',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('"description" is required'); // Matches Joi default for missing field
    });

    it('should fail validation if category is invalid', async () => {
      const postData = {
        title: 'Test title',
        description: 'Test description',
        category: 'invalid',
        type: 'donation',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid category—choose from available options');
    });

    it('should fail validation if type is invalid', async () => {
      const postData = {
        title: 'Test title',
        description: 'Test description',
        category: 'food',
        type: 'invalid',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid post type—choose donation, service, or request');
    });

    it('should fail if details JSON is invalid', async () => {
      const postData = {
        title: 'Test title',
        description: 'Test description',
        category: 'food',
        type: 'donation',
        details: 'invalid json',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Invalid JSON in details—use valid format like {"quantity": 5}');
    });

    it('should fail if more than 5 images are uploaded', async () => {
      // Create a mock image buffer
      const mockImage = Buffer.from('mock image data');

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test title')
        .field('description', 'Test description')
        .field('category', 'food')
        .field('type', 'donation')
        .attach('images', mockImage, 'image1.jpg')
        .attach('images', mockImage, 'image2.jpg')
        .attach('images', mockImage, 'image3.jpg')
        .attach('images', mockImage, 'image4.jpg')
        .attach('images', mockImage, 'image5.jpg')
        .attach('images', mockImage, 'image6.jpg'); // 6th image triggers LIMIT_UNEXPECTED_FILE

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toBe('Upload error: Unexpected field'); // Matches current middleware behavior for LIMIT_UNEXPECTED_FILE
    });
  });

  describe('Successful Post Creation', () => {
    it('should create a post successfully without images', async () => {
      const postData = {
        title: 'Test Post Title',
        description: 'Test Post Description',
        category: 'food',
        type: 'donation',
        tags: 'free, urgent',
        price: 0,
        location: 'Test Location',
        details: '{"quantity": 5}',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('Post created successfully and pending approval');
      expect(res.body.post).toHaveProperty('title', 'Test Post Title');
      expect(res.body.post).toHaveProperty('status', 'Pending Approval');
      expect(res.body.post).toHaveProperty('userID', testUser._id.toString());
      expect(res.body.post.tags).toEqual(['free', 'urgent']);
      expect(res.body.post.details).toEqual({ quantity: 5 });
      expect(res.body.post.images).toEqual([]);

      // Verify post saved in DB
      const savedPost = await Post.findOne({ title: 'Test Post Title' });
      expect(savedPost).not.toBeNull();

      // Verify admin email sent
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();

      // Verify in-app notifications created
      const notifications = await Notification.find({ relatedType: 'post' });
      expect(notifications.length).toBe(1); // One admin
      expect(notifications[0].message).toContain('New post "Test Post Title" in food category awaiting your review.');

      // Verify socket emit called
      expect(mockIo.to).toHaveBeenCalledWith('role-admin');
      expect(mockIo.emit).toHaveBeenCalledWith('new-post-pending', expect.any(Object));
    });

    it('should create a post successfully with images', async () => {
      // Create a mock image buffer
      const mockImage = Buffer.from('mock image data');

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Post with Images')
        .field('description', 'Test Description')
        .field('category', 'food')
        .field('type', 'donation')
        .attach('images', mockImage, 'test1.jpg')
        .attach('images', mockImage, 'test2.jpg');

      expect(res.statusCode).toEqual(201);
      expect(res.body.message).toBe('Post created successfully and pending approval');
      expect(res.body.post.images).toHaveLength(2);
      expect(res.body.post.images[0]).toMatch(/^https:\/\/res\.cloudinary\.com\/mock\/image_\d+\.jpg$/);

      // Verify cloudinary upload called
      const cloudinary = require('cloudinary').v2;
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledTimes(2);
    });

    it('should fail without authentication', async () => {
      const postData = {
        title: 'Test title',
        description: 'Test description',
        category: 'food',
        type: 'donation',
      };

      const res = await request(app)
        .post('/api/posts')
        .send(postData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toBe('Access token required');
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      const postData = {
        title: 'Test title',
        description: 'Test description',
        category: 'food',
        type: 'donation',
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.statusCode).not.toBe(500); 
    });
  });
});