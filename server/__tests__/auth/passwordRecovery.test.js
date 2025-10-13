const User = require('../../src/models/User.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const mockSendMail = jest.fn().mockResolvedValue({});

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail,
  })),
}));

const { forgotPassword, resetPassword } = require('../../src/controllers/auth/passwordRecovery.js');

jest.mock('../../src/models/User.js');
jest.mock('bcryptjs');
jest.mock('crypto');

describe('Auth Password Recovery Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockSendMail.mockClear(); // Clear calls on shared mock
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    it('should return 400 if email is missing', async () => {
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email is required' });
    });

    it('should return 200 with generic message if user not found', async () => {
      req.body = { email: 'nonexistent@example.com' };
      User.findOne.mockResolvedValue(null);
      await forgotPassword(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If the email exists, a reset link has been sent' });
    });

    it('should generate token, save to user, send email, and return 200 if user found', async () => {
      const mockUser = { 
        _id: '123', 
        email: 'test@example.com', 
        save: jest.fn().mockResolvedValue({}) 
      };
      req.body = { email: 'test@example.com' };
      User.findOne.mockResolvedValue(mockUser);
      const mockToken = 'mock-reset-token';
      crypto.randomBytes.mockReturnValue({ toString: jest.fn(() => mockToken) });

      await forgotPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockUser.resetToken).toBe(mockToken);
      expect(mockUser.resetTokenExpiry).toBeGreaterThanOrEqual(Date.now() + 3600000 - 100); // Allow minor timing variance
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: 'Password Reset Request',
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'If the email exists, a reset link has been sent' });
    });

    it('should handle server errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      req.body = { email: 'test@example.com' };
      User.findOne.mockRejectedValue(new Error('Database error'));
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error during password reset request' });
      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if token or newPassword is missing or too short', async () => {
      req.body = { token: 'abc' }; // Missing password
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Valid token and password (min 6 chars) required' });

      req.body = { token: 'abc', newPassword: 'short' }; // Too short
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Valid token and password (min 6 chars) required' });
    });

    it('should return 400 if no user with valid token', async () => {
      req.body = { token: 'invalid-token', newPassword: 'newpass123' };
      User.findOne.mockResolvedValue(null);
      await resetPassword(req, res);
      expect(User.findOne).toHaveBeenCalledWith({
        resetToken: 'invalid-token',
        resetTokenExpiry: { $gt: expect.any(Number) },
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    });

    it('should hash password, update user, clear token, and return 200 if valid', async () => {
      const mockUser = {
        _id: '123',
        email: 'test@example.com',
        resetToken: 'valid-token',
        resetTokenExpiry: Date.now() + 7200000, // 2 hours
        save: jest.fn().mockResolvedValue({}),
      };
      req.body = { token: 'valid-token', newPassword: 'newpass123' };
      User.findOne.mockResolvedValue(mockUser);
      const mockHash = 'mock-hashed-password';
      bcrypt.hash.mockResolvedValue(mockHash);

      await resetPassword(req, res);

      expect(User.findOne).toHaveBeenCalledWith({
        resetToken: 'valid-token',
        resetTokenExpiry: { $gt: expect.any(Number) },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 12);
      expect(mockUser.passwordHash).toBe(mockHash);
      expect(mockUser.resetToken).toBeUndefined();
      expect(mockUser.resetTokenExpiry).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successful' });
    });

    it('should handle server errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      req.body = { token: 'test-token', newPassword: 'newpass123' };
      User.findOne.mockRejectedValue(new Error('Database error'));
      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error during password reset' });
      consoleErrorSpy.mockRestore();
    });
  });
});