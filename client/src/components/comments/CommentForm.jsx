import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createComment, updateComment } from '../../store/comments/commentThunks.js';

const CommentForm = ({ 
  resourceType, 
  resourceId, 
  parentCommentId = null, 
  editComment = null, 
  onSuccess, 
  onCancel,
  placeholder = "Add a comment...",
  autoFocus = false 
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.login);
  const { loading } = useSelector((state) => state.comments);
  
  const [content, setContent] = useState(editComment?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editComment) {
        await dispatch(updateComment({
          resourceType,
          resourceId,
          commentId: editComment._id,
          content: content.trim()
        })).unwrap();
      } else {
        await dispatch(createComment({
          resourceType,
          resourceId,
          content: content.trim(),
          parentCommentId
        })).unwrap();
      }
      
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600">Please log in to leave a comment.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-[#05213C] text-white rounded-full flex items-center justify-center font-semibold text-sm">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#05213C] focus:border-transparent resize-none"
            rows="3"
            disabled={isSubmitting || loading}
          />
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-gray-500">
              <span>Press ⌘+Enter to submit</span>
            </div>
            
            <div className="flex space-x-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting || loading}
                className="px-4 py-2 bg-[#05213C] text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    {editComment ? 'Updating...' : 'Posting...'}
                  </span>
                ) : (
                  editComment ? 'Update' : 'Post'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;