const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  userType: { type: String, enum: ['individual', 'company', 'organization'], required: true },
  bio: { type: String },
  location: { type: String },
  interests: { type: [String] },
  profilePic: { type: String },
  organizationDetails: { type: Object },
  verificationToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' }, // Auto-expire after 24 hours
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
