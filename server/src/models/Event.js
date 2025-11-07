const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  date: { type: Date, required: true },
  time: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  category: { 
    type: String, 
    required: true, 
    enum: ['Workshop', 'Volunteer', 'Market', 'Tech', 'Charity', 'Fair', 'Social', 'Other']
  },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending Approval', 'Published', 'Rejected'], 
    default: 'Pending Approval' 
  },
  rejectionReason: { type: String, default: '', maxlength: 1000 },
  price: { type: Number, min: 0, default: 0 }, // 0 for free
  images: [{ type: String }], // URLs from Cloudinary
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Optional array
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
}, { 
  timestamps: true, // Auto CreatedAt/UpdatedAt
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; } },
  toObject: { virtuals: true }
});

// Index for efficient queries
eventSchema.index({ status: 1, createdAt: -1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ userID: 1, status: 1 });

module.exports = mongoose.model('Event', eventSchema);