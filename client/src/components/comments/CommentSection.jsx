import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Comment from './Comment.jsx';
import CommentForm from './CommentForm.jsx';
import { getComments } from '../../store/comments/commentThunks.js';
import { clearComments, setCurrentResource } from '../../store/comments/commentsSlice.js';

const CommentSection = ({ resourceType, resourceId, resourceTitle }) => {
  const dispatch = useDispatch();
  const { comments, loading, error } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.login); 
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    // Set current resource and load comments
    dispatch(setCurrentResource({ resourceType, resourceId }));
    dispatch(getComments({ resourceType, resourceId, page: 1, limit: 50 }));

    // Cleanup on unmount
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

  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05213C]"></div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#05213C]">
          Community Discussion ({comments.length})
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
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
          placeholder={`Add a comment about this ${resourceType}...`}
          autoFocus={false}
        />
      </div>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-3">💬</div>
            <p>No comments yet. Be the first to share your thoughts!</p>
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
    </section>
  );
};

export default CommentSection;
