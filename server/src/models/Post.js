const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { 
    type: String, 
    required: true, 
    enum: [
      'food', 'tutoring', 'ridesharing', 'housing', 'jobs', 'health', 
      'education', 'goods', 'events', 'transportation', 'financial'
    ] 
  },
  tags: [{ type: String, trim: true, lowercase: true, maxlength: 50 }],
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['Pending Approval', 'Published', 'Rejected'], 
    default: 'Pending Approval' 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['donation', 'service', 'request', 'gathering'] 
  },
  price: { type: Number, min: 0, default: 0 }, // 0 for free
  location: { type: String, trim: true, maxlength: 200 },
  details: { type: mongoose.Schema.Types.Mixed }, // Flexible for category-specific (e.g., { quantity: 5, expiry: Date })
  images: [{ type: String }], // URLs from Cloudinary
}, { 
  timestamps: true, // Auto CreatedAt/UpdatedAt
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; } },
  toObject: { virtuals: true }
});

// Index for efficient queries
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ userID: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);