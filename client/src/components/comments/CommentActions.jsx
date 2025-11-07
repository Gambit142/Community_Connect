import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faReply, 
  faEdit, 
  faTrash, 
  faFlag,
  faCaretDown,
  faCaretUp,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular, faFlag as faFlagRegular } from '@fortawesome/free-regular-svg-icons';

const CommentActions = ({
  likes,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onFlag,
  showReplies,
  onToggleReplies,
  replyCount,
  isOwner = false
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleAction = (action) => {
    action?.();
    setShowMenu(false);
  };

  return (
    <div className="flex items-center justify-between">
      {/* Left side - Main actions */}
      <div className="flex items-center space-x-4">
        {/* Like Button */}
        <button
          onClick={onLike}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-200 ${
            likes.liked 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-red-600'
          }`}
        >
          <FontAwesomeIcon 
            icon={likes.liked ? faHeart : faHeartRegular} 
            className={`w-4 h-4 ${likes.liked ? 'text-red-600' : ''}`}
          />
          <span className="text-sm font-medium">{likes.likeCount}</span>
        </button>

        {/* Reply Button */}
        <button
          onClick={onReply}
          className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200"
        >
          <FontAwesomeIcon icon={faReply} className="w-4 h-4" />
          <span className="text-sm font-medium">Reply</span>
        </button>

        {/* Replies Toggle - Only show if there are replies */}
        {replyCount > 0 && (
          <button
            onClick={onToggleReplies}
            className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
          >
            <span className="text-sm font-medium">
              {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
            </span>
            <FontAwesomeIcon 
              icon={showReplies ? faCaretUp : faCaretDown} 
              className="w-3 h-3" 
            />
          </button>
        )}
      </div>

      {/* Right side - Menu for additional actions */}
      <div className="relative">
        <button
          onClick={handleMenuToggle}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faEllipsisH} className="w-4 h-4" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            {/* Edit Option - Only for owner */}
            {isOwner && onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors duration-200 flex items-center space-x-3"
              >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                <span>Edit Comment</span>
              </button>
            )}

            {/* Delete Option - Only for owner */}
            {isOwner && onDelete && (
              <button
                onClick={() => handleAction(onDelete)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors duration-200 flex items-center space-x-3"
              >
                <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                <span>Delete Comment</span>
              </button>
            )}

            {/* Flag Option - Only for non-owner */}
            {!isOwner && onFlag && (
              <button
                onClick={() => handleAction(onFlag)}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors duration-200 flex items-center space-x-3"
              >
                <FontAwesomeIcon icon={faFlagRegular} className="w-4 h-4" />
                <span>Flag Comment</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Close menu when clicking outside */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default CommentActions;
