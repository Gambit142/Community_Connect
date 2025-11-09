import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { getNotifications, markAsReadThunk, markAllAsReadThunk } from '../../store/notifications/notificationsSlice.js';
import { getPostById, clearCurrentPost } from '../../store/posts/postsSlice.js';
import PostDetailsModal from '../../components/PostDetailsModal.jsx';

// SVG Icons for consistency
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="white" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const EmptyMessageIcon = () => (
  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#05213C] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your messages...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="flex items-center justify-center w-12 h-12 bg-[#05213C] rounded-xl">
                  <MessageIcon />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                  <p className="text-gray-500 text-sm">
                    {unreadCount > 0 
                      ? `${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}`
                      : 'All messages read'
                    }
                  </p>
                </div>
              </div>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-6 py-3 bg-[#05213C] text-white font-semibold rounded-xl hover:bg-[#051A2F] transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Mark All as Read
                </button>
              )}
            </div>
          </div>

          {/* Messages List */}
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-300 mb-6">
                <EmptyMessageIcon />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                When you receive messages and notifications, they'll appear here. Stay connected!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`group p-6 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    !notification.isRead
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        {/* Status Indicator */}
                        <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                          !notification.isRead ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        
                        <div className="flex-1">
                          <p className={`text-lg font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            {notification.relatedType === 'post' && notification.relatedID && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
                                Post Update
                              </span>
                            )}
                          </div>

                          {notification.relatedID && notification.relatedType === 'post' && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Related post:</span> {notification.relatedID.title || 'N/A'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Mark as Read Button */}
                    {!notification.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification._id);
                        }}
                        className="ml-4 p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Mark as read"
                      >
                        <CheckIcon />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Stats */}
          {notifications.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Showing {notifications.length} {notifications.length === 1 ? 'message' : 'messages'}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>
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