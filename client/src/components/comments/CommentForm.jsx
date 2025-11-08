import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createComment, updateComment } from '../../store/comments/commentThunks.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import styles from '../../assets/css/CommentForm.module.css';

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
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [autoFocus, content.length]);

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
      <div className={styles.authPrompt}>
        <div className={styles.authIcon}>
          <FontAwesomeIcon icon={faPaperPlane} className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-gray-700 font-medium mb-2">Join the conversation</p>
        <p className="text-gray-600 text-sm mb-4">Sign in to share your thoughts and connect with others</p>
        <button 
          onClick={() => window.location.href = '/auth/login'}
          className={styles.authButton}
        >
          Sign In to Comment
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className="flex space-x-4">
        <div className={styles.userAvatar}>
          {user.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1">
          <div className="mb-4">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={styles.textarea}
              rows="3"
              disabled={isSubmitting || loading}
            />
          </div>
          
          <div className={styles.footer}>
            <div className={styles.hotkeyHint}>
              ⌘ + Enter to submit
            </div>
            
            <div className={styles.buttonGroup}>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className={styles.cancelButton}
                  disabled={isSubmitting}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              )}
              
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting || loading}
                className={styles.submitButton}
              >
                {isSubmitting ? (
                  <>
                    <div className={`${styles.submitSpinner} w-4 h-4 border-2 border-white border-t-transparent rounded-full`} />
                    <span>{editComment ? 'Updating...' : 'Posting...'}</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
                    <span>{editComment ? 'Update' : 'Post Comment'}</span>
                  </>
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