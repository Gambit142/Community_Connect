const { login } = require('../../src/controllers/auth/login.js');
const User = require('../../src/models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Login Controller', () => {
  let req, res, selectMock;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    selectMock = jest.fn();
    User.findOne.mockImplementation(() => ({ select: selectMock }));
    jest.clearAllMocks();
  });

  it('should return 400 if email or password is missing', async () => {
    req.body = { email: '' };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    req.body = { email: 'test@example.com', password: 'password123' };
    selectMock.mockResolvedValue(null);
    await login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(selectMock).toHaveBeenCalledWith('+passwordHash');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should return 401 if user is not verified', async () => {
    const mockUser = { _id: '123', email: 'test@example.com', isVerified: false, passwordHash: '$2a$10$hash' };
    req.body = { email: 'test@example.com', password: 'password123' };
    selectMock.mockResolvedValue(mockUser);
    await login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(selectMock).toHaveBeenCalledWith('+passwordHash');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Please verify your email before logging in' });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should return 401 if password does not match', async () => {
    const mockUser = {
      _id: '123',
      email: 'test@example.com',
      isVerified: true,
      passwordHash: '$2a$10$hash',
    };
    req.body = { email: 'test@example.com', password: 'wrongpassword' };
    selectMock.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);
    await login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(selectMock).toHaveBeenCalledWith('+passwordHash');
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.passwordHash);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
  });

  it('should successfully login and return token and user info', async () => {
    const mockUser = {
      _id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'member',
      userType: 'individual',
      isVerified: true,
      passwordHash: '$2a$10$hash',
    };
    req.body = { email: 'test@example.com', password: 'password123' };
    selectMock.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    const mockToken = 'mock-jwt-token';
    jwt.sign.mockReturnValue(mockToken);

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(selectMock).toHaveBeenCalledWith('+passwordHash');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.passwordHash);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: mockUser._id, role: mockUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
      user: {
        id: mockUser._id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        userType: mockUser.userType,
      },
      message: 'Login successful',
    });
  });

  it('should handle server errors', async () => {
    req.body = { email: 'test@example.com', password: 'password123' };
    selectMock.mockRejectedValue(new Error('Database error'));
    await login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(selectMock).toHaveBeenCalledWith('+passwordHash');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error during login' });
  });
});