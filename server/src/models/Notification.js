const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  type: {
    type: String,
    required: true,
    enum: [
      'post_status', 
      'event_status', 
      'new_post_review', 
      'new_event_review',
      'event_registration', 
      'new_event_registration',
      'comment_on_post',
      'comment_on_event',
      'reply_to_comment',
      'tag_in_comment',
      'comment_flagged',
      'comment_approved' 
    ]
  },
  relatedID: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // e.g., PostID or EventID or CommentID
  relatedType: { type: String, enum: ['post', 'event', 'comment'], required: true },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true, // Auto CreatedAt/UpdatedAt
  toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; } },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
notificationSchema.index({ userID: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);