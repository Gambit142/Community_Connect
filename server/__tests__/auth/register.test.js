const bcrypt = require('bcryptjs');
const Joi = require('joi');
const User = require('../../src/models/User.js');
const { registerSchema, register, verify } = require('../../src/controllers/auth/register.js');
const PendingUser = require('../../src/models/PendingUser.js');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../src/index.js');

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

describe('Registration Validation and Hashing', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await PendingUser.deleteMany({});
  });

  it('should validate user input with Joi', () => {
    const data = {
      username: 'test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      userType: 'individual',
    };
    const { error } = registerSchema.validate(data);
    expect(error).toBeUndefined();
  });

  it('should fail validation if passwords mismatch', () => {
    const data = {
      username: 'test',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'wrong',
      userType: 'individual',
    };
    const { error } = registerSchema.validate(data);
    expect(error).not.toBeUndefined();
    expect(error.details[0].message).toBe('Confirm password must match password');
  });

  it('should hash password with bcrypt', async () => {
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    expect(hashed).not.toBe(password);
    expect(await bcrypt.compare(password, hashed)).toBe(true);
  });
});

describe('Registration API Integration', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await PendingUser.deleteMany({});
  });

  it('should register a user and send verification email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'individual',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toContain('Registration successful');
    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
  });

  it('should fail if passwords mismatch', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'wrong',
        userType: 'individual',
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Confirm password must match password');
  });

  it('should verify and create user', async () => {
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const pending = new PendingUser({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      userType: 'individual',
      verificationToken: 'testtoken',
    });
    await pending.save();

    const res = await request(app).get('/api/auth/verify/testtoken');
    expect(res.statusCode).toEqual(302); // Redirect to login
    expect(res.headers.location).toBe('http://localhost:5173/auth/login');
    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
    expect(user.isVerified).toBe(true);
  });
});
