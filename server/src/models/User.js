const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ['member', 'admin'], required: true, default: 'member' },
    userType: { type: String, enum: ['individual', 'company', 'organization'], required: true },
    bio: { type: String, required: false },
    location: { type: String, required: false },
    interests: { type: [String], required: false },
    profilePic: { type: String, required: false },
    resetToken: { type: String, required: false },
    resetTokenExpiry: { type: Date, required: false },
    organizationDetails: { type: Object, required: false },
    verificationToken: { type: String, required: false },
    isVerified: { type: Boolean, default: false, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);