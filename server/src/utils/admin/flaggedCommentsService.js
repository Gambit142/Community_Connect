const Comment = require('../../models/Comment.js');
const Post = require('../../models/Post.js');
const Event = require('../../models/Event.js');
const User = require('../../models/User.js');
const Notification = require('../../models/Notification.js');

const getModel = (type) => {
  switch (type) {
    case 'post': return Post;
    case 'event': return Event;
    default: throw new Error('Unsupported resource type');
  }
};

const createNotification = async (targetId, message, type, relatedID, relatedType, user) => {
  const notif = new Notification({
    userID: targetId,
    message,
    type,
    relatedID,
    relatedType,
    isRead: false,
  });
  await notif.save();
  global.io.to(`user-${targetId}`).emit('new-notification', notif.toObject());
};

// Get flagged comments (admin only, with population for display)
const getFlaggedComments = async (page = 1, limit = 10, search = '') => {
  const skip = (page - 1) * limit;
  
  // Build filter query
  const filter = { 
    deleted: false, 
    flags: { $exists: true, $ne: [] } // Flagged and not empty
  };
  if (search) {
    filter.content = { $regex: search, $options: 'i' }; // Case-insensitive search on content
  }
  
  const comments = await Comment.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate({
      path: 'userId',
      select: 'username profilePic'
    })
    .populate({
      path: 'flags',
      select: 'username' // Populate who flagged
    })
    .lean();

  // Manual population for relatedId (since no ref in schema)
  for (let comment of comments) {
    const Model = getModel(comment.relatedType);
    const relatedDoc = await Model.findById(comment.relatedId).select('title category').lean();
    comment.relatedId = relatedDoc || { title: 'Unknown Resource', category: 'N/A' };
  }

  const total = await Comment.countDocuments(filter);
  const pagination = {
    current: page,
    pages: Math.ceil(total / limit),
    total
  };

  return { comments, pagination };
};

// Unflag/approve comment (admin only)
const unflagComment = async (commentId, adminId) => {
  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) {
    throw new Error('Comment not found');
  }
  if (comment.flags.length === 0) {
    throw new Error('Comment is not flagged');
  }

  // Clear all flags (unflag completely)
  comment.flags = [];
  await comment.save();

  // Optional: Notify original poster (using new 'comment_approved' type)
  if (comment.userId && comment.userId.toString() !== adminId.toString()) {
    const relatedDoc = await getModel(comment.relatedType).findById(comment.relatedId).select('title');
    const message = `Your comment on "${relatedDoc.title}" has been reviewed and approved by admin.`;
    await createNotification(comment.userId, message, 'comment_approved', commentId, 'comment', { username: 'Admin' });
  }

  return comment;
};

// New: Admin soft-delete flagged comment (bypasses ownership, sets deleted: true)
const deleteFlaggedComment = async (commentId, adminId) => {
  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) {
    throw new Error('Comment not found');
  }

  // Admin bypass: Soft delete (set deleted: true instead of hard delete)
  comment.deleted = true;
  await comment.save();

  // Decrement related count
  const updateRelatedCount = async (relatedType, relatedId, increment) => {
    const Model = getModel(relatedType);
    await Model.updateOne({ _id: relatedId }, { $inc: { commentCount: increment } });
  };
  await updateRelatedCount(comment.relatedType, comment.relatedId, -1);

  // Optional: Notify owner
  if (comment.userId && comment.userId.toString() !== adminId.toString()) {
    const relatedDoc = await getModel(comment.relatedType).findById(comment.relatedId).select('title');
    const message = `Your comment on "${relatedDoc.title}" has been removed by admin after review.`;
    await createNotification(comment.userId, message, 'comment_flagged', commentId, 'comment', { username: 'Admin' });
  }

  return { message: 'Comment deleted successfully' };
};

module.exports = {
  getFlaggedComments,
  unflagComment,
  deleteFlaggedComment,
};