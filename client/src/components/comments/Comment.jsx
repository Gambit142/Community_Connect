import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCommentLike, flagComment, deleteComment } from '../store/comments/commentThunks.js';
import CommentForm from './CommentForm.jsx';
import CommentActions from './CommentActions.jsx';

const Comment = ({ 
  comment, 
  resourceType, 
  resourceId, 
  resourceTitle, 
  currentUser, 
  onReply, 
  onEdit, 
  onCancel,
  replyingTo,
  editingComment,
  level = 0 
}) => {
  const dispatch = useDispatch();
  const [showReplies, setShowReplies] = useState(true);
  const [localLikes, setLocalLikes] = useState({ liked: comment.isLiked, likeCount: comment.likeCount });

  const isOwner = currentUser && comment.userId._id === currentUser.id;
  const isEditing = editingComment?._id === comment._id;
  const isReplying = replyingTo === comment._id;

  const handleLike = async () => {
    try {
      const result = await dispatch(toggleCommentLike({
        resourceType,
        resourceId,
        commentId: comment._id
      })).unwrap();
      
      setLocalLikes({ liked: result.liked, likeCount: result.likeCount });
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleFlag = () => {
    if (window.confirm('Are you sure you want to flag this comment?')) {
      dispatch(flagComment({
        resourceType,
        resourceId,
        commentId: comment._id
      }));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment({
        resourceType,
        resourceId,
        commentId: comment._id
      }));
    }
  };

  const handleEditClick = () => {
    onEdit(comment);
  };

  const handleReplyClick = () => {
    onReply(comment._id);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const hasReplies = comment.children && comment.children.length > 0;

  return (
    <div className={`relative ${level > 0 ? 'ml-8' : ''}`}>
      {/* Thread line for nested comments */}
      {level > 0 && (
        <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
      )}
      
      <div className={`bg-white rounded-lg border border-gray-100 p-4 hover:border-gray-200 transition-colors ${
        level > 0 ? 'border-l-2 border-l-blue-100' : ''
      }`}>
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-[#05213C] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {comment.userId.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {comment.userId.username}
                {isOwner && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </h4>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatTimeAgo(comment.createdAt)}</span>
                {comment.editedAt && (
                  <span className="text-gray-400">• edited</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <CommentForm
            resourceType={resourceType}
            resourceId={resourceId}
            parentCommentId={comment.parentComment}
            editComment={comment}
            onSuccess={onCancel}
            onCancel={onCancel}
            autoFocus={true}
          />
        ) : (
          <div className="mb-3">
            <p className="text-gray-700 whitespace-pre-wrap">
              {comment.content.split(' ').map((word, index) => 
                word.startsWith('@') ? (
                  <span key={index} className="text-blue-600 font-medium">
                    {word}{' '}
                  </span>
                ) : (
                  <span key={index}>{word} </span>
                )
              )}
            </p>
          </div>
        )}

        {/* Comment Actions */}
        {!isEditing && (
          <CommentActions
            likes={localLikes}
            onLike={handleLike}
            onReply={handleReplyClick}
            onEdit={isOwner ? handleEditClick : null}
            onDelete={isOwner ? handleDelete : null}
            onFlag={!isOwner ? handleFlag : null}
            showReplies={hasReplies && showReplies}
            onToggleReplies={() => setShowReplies(!showReplies)}
            replyCount={comment.children?.length || 0}
          />
        )}

        {/* Reply Form */}
        {isReplying && !isEditing && (
          <div className="mt-4 ml-8">
            <CommentForm
              resourceType={resourceType}
              resourceId={resourceId}
              parentCommentId={comment._id}
              onSuccess={onCancel}
              onCancel={onCancel}
              placeholder={`Replying to ${comment.userId.username}...`}
              autoFocus={true}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && !isEditing && (
        <div className="mt-4 space-y-4">
          {comment.children.map((childComment) => (
            <Comment
              key={childComment._id}
              comment={childComment}
              resourceType={resourceType}
              resourceId={resourceId}
              resourceTitle={resourceTitle}
              currentUser={currentUser}
              onReply={onReply}
              onEdit={onEdit}
              onCancel={onCancel}
              replyingTo={replyingTo}
              editingComment={editingComment}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
