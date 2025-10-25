const request = require('supertest');
const { app } = require('../../src/index.js');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User.js');

jest.mock('../../src/models/User.js');
jest.mock('jsonwebtoken');

jest.setTimeout(10000);

describe('Protected Routes', () => {
  let mockToken;
  let mockUser;

  beforeEach(() => {
    mockUser = {
      _id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'member',
      userType: 'individual',
    };
    mockToken = 'mock-valid-token';
    jwt.verify.mockReturnValue({ id: mockUser._id });
    User.findById.mockResolvedValue(mockUser);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Profile Route (/api/profile)', () => {
    it('should return 200 with user profile for valid token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toEqual(200);
      expect(res.body.message).toBe('Profile retrieved successfully');
      expect(res.body.user.username).toBe('testuser');
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id, '-passwordHash');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/profile');
      expect(res.status).toEqual(401);
      expect(res.body.message).toBe('Access token required');
    });

    it('should return 403 with invalid token', async () => {
      jwt.verify.mockImplementation(() => { throw new Error('Invalid'); });
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toEqual(403);
      expect(res.body.message).toBe('Invalid or expired token');
    });

    it('should return 401 if user not found', async () => {
      User.findById.mockResolvedValue(null);
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toEqual(401);
      expect(res.body.message).toBe('Invalid token');
      expect(User.findById).toHaveBeenCalledWith(mockUser._id, '-passwordHash');
    });
  });

  describe('Admin Users Route (/api/admin/users)', () => {
    it('should return 200 for admin role', async () => {
      mockUser.role = 'admin';
      User.findById.mockResolvedValue(mockUser);
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toEqual(200);
      expect(res.body.message).toBe('All users retrieved successfully');
      expect(User.findById).toHaveBeenCalledWith(mockUser._id, '-passwordHash');
    });

    it('should return 403 for non-admin role', async () => {
      mockUser.role = 'member';
      User.findById.mockResolvedValue(mockUser);
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${mockToken}`);
      expect(res.status).toEqual(403);
      expect(res.body.message).toContain('Role member not authorized');
      expect(User.findById).toHaveBeenCalledWith(mockUser._id, '-passwordHash');
    });
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Flush async DB logs
  });
});