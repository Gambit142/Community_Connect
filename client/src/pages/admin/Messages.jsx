import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getNotifications, markAsReadThunk, markAllAsReadThunk } from '../../store/notifications/notificationsSlice.js';
import { getPostById, clearCurrentPost } from '../../store/posts/postsSlice.js';
import PostDetailsModal from '../../components/PostDetailsModal.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

export default function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  // Check for postId from nav state (e.g., from Navbar click)
  useEffect(() => {
    const postId = location.state?.postId;
    if (postId) {
      dispatch(getPostById(postId)).unwrap().then((result) => {
        setSelectedPost(result.post);
        setShowPostModal(true);
      }).catch((err) => {
        console.error('Failed to fetch post:', err);
      });
      // Clear state after use
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [dispatch, location]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsReadThunk(notificationId)); 
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsReadThunk());
  };

  const handleNotificationClick = async (notification) => {
    if (notification.relatedType === 'post' && notification.relatedID) {
      try {
        const result = await dispatch(getPostById(notification.relatedID._id)).unwrap();
        setSelectedPost(result.post);
        setShowPostModal(true);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        // Optionally show error toast or message
      }
      if (!notification.isRead) {
        handleMarkAsRead(notification._id);
      }
    }
    // Handle other types as needed
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    dispatch(clearCurrentPost());
  };

  if (loading) {
    return <div className="text-center py-4">Loading notifications...</div>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">View all your notifications</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {unreadCount} unread
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-[#05213C] text-white rounded-md hover:bg-white hover:text-[#05213C] border border-[#05213C] text-sm font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faEnvelopeOpen} className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border ${
                  !notification.isRead 
                    ? 'bg-gray-100 border-gray-200 hover:bg-gray-200' 
                    : 'bg-white border-gray-100 hover:bg-gray-50'
                } cursor-pointer transition-colors`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      notification.isRead ? 'text-gray-600' : 'text-gray-900'
                    }`}>
                      {notification.message}
                    </p>
                    {notification.relatedID && notification.relatedType === 'post' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Related to post: {notification.relatedID.title || 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs ${
                      notification.isRead ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Details Modal */}
      <PostDetailsModal 
        post={selectedPost} 
        onClose={handleCloseModal}
        showEditButton={false}
      />
    </>
  );
}