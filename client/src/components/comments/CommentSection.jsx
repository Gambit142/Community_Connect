import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';
import { getComments } from '../../store/comments/commentThunks.js';
import { clearComments, setCurrentResource } from '../../store/comments/commentsSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComments, faSort, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/css/CommentSection.module.css';

const CommentSection = ({ resourceType, resourceId, resourceTitle }) => {
  const dispatch = useDispatch();
  const { comments, loading, error, pagination } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.login); 
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    dispatch(setCurrentResource({ resourceType, resourceId }));
    dispatch(getComments({ resourceType, resourceId, page: 1, limit: 50 }));

    return () => {
      dispatch(clearComments());
    };
  }, [dispatch, resourceType, resourceId]);

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setEditingComment(null);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleCancel = () => {
    setReplyingTo(null);
    setEditingComment(null);
  };

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + (comment.children ? comment.children.length : 0);
  }, 0);

  if (loading && comments.length === 0) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <p className="text-gray-600">Loading comments...</p>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FontAwesomeIcon icon={faComments} className="w-6 h-6 text-white" />
          </div>
          <div className={styles.headerText}>
            <h2>Community Discussion</h2>
            <p>{totalComments} {totalComments === 1 ? 'comment' : 'comments'}</p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="relative">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-liked">Most Liked</option>
          </select>
          <FontAwesomeIcon 
            icon={faSort} 
            className={styles.sortIcon + ' w-3 h-3'}
          />
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Add new comment form */}
      <div className="mb-8">
        <CommentForm
          resourceType={resourceType}
          resourceId={resourceId}
          parentCommentId={null}
          onSuccess={handleCancel}
          placeholder={`Share your thoughts about this ${resourceType}...`}
          autoFocus={false}
        />
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faComments} className="w-8 h-8 text-gray-400" />
            </div>
            <h3>No comments yet</h3>
            <p>Be the first to share your thoughts and start the conversation!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              resourceType={resourceType}
              resourceId={resourceId}
              resourceTitle={resourceTitle}
              currentUser={user}
              onReply={handleReply}
              onEdit={handleEdit}
              onCancel={handleCancel}
              replyingTo={replyingTo}
              editingComment={editingComment}
              level={0}
            />
          ))
        )}
      </div>

      {/* Load More Button */}
      {pagination?.hasNext && (
        <div className="flex justify-center">
          <button
            onClick={() => dispatch(getComments({ 
              resourceType, 
              resourceId, 
              page: pagination.currentPage + 1, 
              limit: 50 
            }))}
            className={styles.loadMoreButton}
          >
            Load More Comments
          </button>
        </div>
      )}
    </section>
  );
};

export default CommentSection;