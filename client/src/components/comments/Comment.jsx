import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCommentLike, flagComment, deleteComment } from '../../store/comments/commentThunks.js';
import CommentForm from './CommentForm.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faEdit, faTrash, faFlag, faHeart, faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import styles from '../../assets/css/Comment.module.css';

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
  const [localLikes, setLocalLikes] = useState({ 
    liked: comment.isLiked, 
    likeCount: comment.likeCount 
  });

  const isOwner = currentUser && comment.userId._id === currentUser.id;
  const isEditing = editingComment?._id === comment._id;
  const isReplying = replyingTo === comment._id;
  const hasReplies = comment.children && comment.children.length > 0;

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
    return date.toLocaleDateString();
  };

  return (
    <div className={`${styles.commentThread} ${level > 0 ? styles.nestedComment : ''}`}>
      {/* Thread line for nested comments */}
      {level > 0 && (
        <div className={styles.threadLine} />
      )}
      
      <div className={`${styles.commentCard} ${level > 0 ? styles.nestedCard : ''}`}>
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={styles.userAvatar}>
              {comment.userId.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {comment.userId.username}
                </h4>
                {isOwner && (
                  <span className={styles.userBadge + ' ' + styles.ownerBadge}>
                    You
                  </span>
                )}
                {comment.userId.role === 'admin' && (
                  <span className={styles.userBadge + ' ' + styles.adminBadge}>
                    Admin
                  </span>
                )}
              </div>
              <div className={styles.metaInfo}>
                <span>{formatTimeAgo(comment.createdAt)}</span>
                {comment.editedAt && (
                  <>
                    <span>•</span>
                    <span>edited</span>
                  </>
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
          <div className="mb-4">
            <p className={styles.commentContent}>
              {comment.content.split(' ').map((word, index) => 
                word.startsWith('@') ? (
                  <span key={index} className={styles.mention}>
                    {word}
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
          <div className={styles.actionsContainer}>
            <div className={styles.actionButtons}>
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`${styles.actionButton} ${styles.likeButton} ${
                  localLikes.liked ? styles.likeButtonActive : ''
                }`}
              >
                <FontAwesomeIcon 
                  icon={localLikes.liked ? faHeart : faHeartRegular} 
                  className="w-4 h-4"
                />
                <span>{localLikes.likeCount}</span>
              </button>

              {/* Reply Button */}
              <button
                onClick={handleReplyClick}
                className={`${styles.actionButton} ${styles.replyButton}`}
              >
                <FontAwesomeIcon icon={faReply} className="w-4 h-4" />
                <span>Reply</span>
              </button>

              {/* Replies Toggle */}
              {hasReplies && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className={`${styles.actionButton} ${styles.repliesButton}`}
                >
                  <span>
                    {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
                  </span>
                  <FontAwesomeIcon 
                    icon={showReplies ? faCaretUp : faCaretDown} 
                    className="w-4 h-4" 
                  />
                </button>
              )}
            </div>

            {/* Action Menu */}
            <div className={styles.menuButtons}>
              {isOwner && (
                <>
                  <button
                    onClick={handleEditClick}
                    className={`${styles.menuButton} ${styles.editButton}`}
                    title="Edit comment"
                  >
                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className={`${styles.menuButton} ${styles.deleteButton}`}
                    title="Delete comment"
                  >
                    <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                  </button>
                </>
              )}
              {!isOwner && (
                <button
                  onClick={handleFlag}
                  className={`${styles.menuButton} ${styles.flagButton}`}
                  title="Flag comment"
                >
                  <FontAwesomeIcon icon={faFlag} className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reply Form */}
        {isReplying && !isEditing && (
          <div className={styles.replyForm}>
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