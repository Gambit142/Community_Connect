const Comment = require('../../models/Comment.js');
const Post = require('../../models/Post.js');
const Event = require('../../models/Event.js');
const User = require('../../models/User.js');
const Notification = require('../../models/Notification.js');
const { createCommentSchema, updateCommentSchema } = require('./validators.js');

const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getModel = (type) => {
  switch (type) {
    case 'post': return Post;
    case 'event': return Event;
    default: throw new Error('Unsupported resource type');
  }
};

const validateAccess = async (userId, relatedType, relatedId) => {
  const Model = getModel(relatedType);
  const doc = await Model.findById(relatedId).select('status userID title');
  if (!doc) {
    throw new Error('Related item not found');
  }
  // For public reads (userId null), allow only if published
  if (doc.status !== 'Published' && (!userId || doc.userID.toString() !== userId.toString())) {
    throw new Error('Unauthorized access to unpublished item');
  }
  return doc;
};

const parseAndValidateTags = async (content, userId) => {
  const mentions = content.match(/@(\w+)/g) || [];
  const usernames = [...new Set(mentions.map(m => m.slice(1)))];
  const tags = [];
  for (const username of usernames) {
    const taggedUser = await User.findOne({
      username: new RegExp(`^${escapeRegex(username)}$`, 'i')
    }).select('_id');
    if (taggedUser && taggedUser._id.toString() !== userId.toString()) {
      tags.push(taggedUser._id);
    }
  }
  return tags;
};

const updateRelatedCount = async (relatedType, relatedId, increment) => {
  const Model = getModel(relatedType);
  await Model.updateOne({ _id: relatedId }, { $inc: { commentCount: increment } });
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

const sendCommentNotifications = async (comment, user, relatedDoc, relatedType) => {
  const userIdStr = user._id.toString();
  const creatorIdStr = relatedDoc.userID.toString();
  const notifType = comment.parentComment ? 'reply_to_comment' : `comment_on_${relatedType}`;
  let message, targets;

  if (!comment.parentComment) {
    // Top-level comment
    if (creatorIdStr !== userIdStr) {
      message = `${user.username} commented on your ${relatedType}: "${relatedDoc.title}"`;
      await createNotification(creatorIdStr, message, notifType, comment._id, 'comment', user);
    }
  } else {
    // Reply
    const parent = await Comment.findById(comment.parentComment).select('userId');
    if (!parent) return;
    const parentUserIdStr = parent.userId.toString();
    targets = new Set();
    if (parentUserIdStr !== userIdStr) targets.add(parentUserIdStr);
    if (creatorIdStr !== userIdStr && !targets.has(creatorIdStr)) targets.add(creatorIdStr);
    for (const target of targets) {
      message = `${user.username} replied to your comment on ${relatedType} "${relatedDoc.title}"`;
      await createNotification(target, message, 'reply_to_comment', comment._id, 'comment', user);
    }
  }

  // Tags
  for (const tagId of comment.tags) {
    const tagIdStr = tagId.toString();
    if (tagIdStr !== userIdStr) {
      message = `${user.username} mentioned you (@${user.username}) in a comment on ${relatedType} "${relatedDoc.title}"`;
      await createNotification(tagIdStr, message, 'tag_in_comment', comment._id, 'comment', user);
    }
  }
};

const createComment = async (user, relatedType, relatedId, data) => {
  const { error, value } = createCommentSchema.validate(data);
  if (error) throw new Error(error.details[0].message);

  const { content, parentCommentId } = value;
  const relatedDoc = await validateAccess(user._id, relatedType, relatedId);

  // Validate parent comment if provided
  if (parentCommentId) {
    const parent = await Comment.findOne({ 
      _id: parentCommentId,
      relatedType,
      relatedId,
      deleted: false
    });
    if (!parent) {
      throw new Error('Invalid parent comment');
    }
  }

  const tags = await parseAndValidateTags(content, user._id);

  const comment = new Comment({
    content: content.trim(),
    parentComment: parentCommentId || null,
    relatedType,
    relatedId,
    userId: user._id,
    tags,
    likes: [],
    flags: [],
  });

  await comment.save();
  await comment.populate('userId', 'username profilePic role');
  await comment.populate('tags', 'username');
  await updateRelatedCount(relatedType, relatedId, 1);
  await sendCommentNotifications(comment, user, relatedDoc, relatedType);

  return comment;
};

const getCommentsTree = async (relatedType, relatedId, { page = 1, limit = 10, userId = null }) => {
  await validateAccess(userId, relatedType, relatedId);
  const skip = (page - 1) * limit;

  // Get ALL comments for this resource (not paginated at DB level for proper tree building)
  const comments = await Comment.find({ 
    relatedType, 
    relatedId, 
    deleted: false 
  })
    .populate('userId', 'username profilePic role')
    .populate('tags', 'username')
    .sort({ createdAt: -1 })
    .lean();

  // Build the comment tree
  const commentMap = {};
  const topLevel = [];

  // First pass: create all comment objects with empty children
  comments.forEach(c => {
    commentMap[c._id] = {
      ...c,
      likeCount: c.likes.length,
      isLiked: userId ? c.likes.some(l => l.toString() === userId) : false,
      children: []
    };
  });

  // Second pass: build the tree structure
  comments.forEach(c => {
    const commentObj = commentMap[c._id];
    if (c.parentComment && commentMap[c.parentComment]) {
      // This is a reply, add to parent's children
      commentMap[c.parentComment].children.push(commentObj);
    } else {
      // This is a top-level comment
      topLevel.push(commentObj);
    }
  });

  // Sort children by date (newest first) for each parent
  Object.values(commentMap).forEach(comment => {
    if (comment.children.length > 0) {
      comment.children.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  });

  // Sort top-level comments by date (newest first)
  topLevel.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Apply pagination to top-level comments only
  const paginated = topLevel.slice(skip, skip + limit);
  const totalTopLevel = topLevel.length;
  const totalPages = Math.ceil(totalTopLevel / limit);

  return {
    comments: paginated,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalTopLevel,
      totalComments: comments.length,
      hasNext: skip + limit < totalTopLevel,
    },
  };
};

const updateComment = async (commentId, userId, data) => {
  const { error, value } = updateCommentSchema.validate(data);
  if (error) throw new Error(error.details[0].message);

  const comment = await Comment.findById(commentId);
  if (!comment || comment.userId.toString() !== userId.toString() || comment.deleted) {
    throw new Error('Unauthorized to update this comment');
  }

  comment.content = value.content.trim();
  comment.editedAt = new Date();
  await comment.save();
  await comment.populate('userId', 'username profilePic role');
  await comment.populate('tags', 'username');

  return comment;
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment || comment.userId.toString() !== userId.toString() || comment.deleted) {
    throw new Error('Unauthorized to delete this comment');
  }

  await Comment.findByIdAndDelete(commentId);
  await updateRelatedCount(comment.relatedType, comment.relatedId, -1);
};

const toggleCommentLike = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) throw new Error('Comment not found');

  const userIdStr = userId.toString();
  const index = comment.likes.findIndex(l => l.toString() === userIdStr);
  let liked;
  if (index > -1) {
    comment.likes.splice(index, 1);
    liked = false;
  } else {
    comment.likes.push(userId);
    liked = true;
  }
  await comment.save();
  return { liked, likeCount: comment.likes.length };
};

const flagComment = async (commentId, userId, username, relatedType, relatedId) => {
  const comment = await Comment.findById(commentId);
  if (!comment || comment.deleted) throw new Error('Comment not found');
  if (comment.flags.some(f => f.toString() === userId.toString())) {
    throw new Error('Already flagged');
  }

  comment.flags.push(userId);
  await comment.save();

  const Model = getModel(relatedType);
  const relatedDoc = await Model.findById(relatedId).select('title');
  const message = `Comment flagged by ${username} on ${relatedType} "${relatedDoc.title}"`;
  const admins = await User.find({ role: 'admin' }).select('_id');

  for (const admin of admins) {
    await createNotification(admin._id, message, 'comment_flagged', commentId, 'comment', { username: 'System' });
  }
};

const toggleResourceLike = async (relatedType, relatedId, userId) => {
  const Model = getModel(relatedType);
  const doc = await Model.findById(relatedId);
  if (!doc) throw new Error(`${relatedType.charAt(0).toUpperCase() + relatedType.slice(1)} not found`);

  const userIdStr = userId.toString();
  const index = doc.likes.findIndex(l => l.toString() === userIdStr);
  let liked;
  if (index > -1) {
    doc.likes.splice(index, 1);
    liked = false;
  } else {
    doc.likes.push(userId);
    liked = true;
  }
  await doc.save();
  return { liked, likeCount: doc.likes.length };
};

module.exports = {
  createComment,
  getCommentsTree,
  updateComment,
  deleteComment,
  toggleCommentLike,
  flagComment,
  toggleResourceLike,
  getModel,
};