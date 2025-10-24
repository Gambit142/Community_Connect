import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNotifications, markAsReadThunk } from '../../store/notifications/notificationsSlice.js';
import { getPostById, clearCurrentPost } from '../../store/posts/postsSlice.js';
import { logout } from '../../store/auth/loginSlice.js';
import PostDetailsModal from '../../components/PostDetailsModal.jsx';
import {
  faBell,
  faSearch,
  faUserCircle,
  faCog,
  faEnvelopeOpen,
  faUserShield,
  faSignOutAlt,
  faBars,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

export default function Navbar({ onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      dispatch(getNotifications());
    }
  }, [dispatch, token]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsReadThunk(notificationId));
  };

  const handleNotificationClick = async (notification) => {
    setShowNotifications(false);
    if (notification.relatedType === 'post' && notification.relatedID) {
      try {
        const result = await dispatch(getPostById(notification.relatedID._id)).unwrap();
        setSelectedPost(result.post);
        setShowPostModal(true);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        // Optionally show error toast or message
      }
    }
    // Handle other types as needed
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    dispatch(clearCurrentPost());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="flex-1 max-w-lg ml-4 lg:ml-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search"
              />
            </div>
          </div>

          {/* Right side - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 relative"
                disabled={loading}
              >
                <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-400"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                      Notifications ({unreadCount} unread)
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            !notification.isRead ? 'bg-gray-100' : 'bg-white'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                {notification.message}
                              </p>
                              {notification.relatedID && notification.relatedType === 'post' && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Related to post: {notification.relatedID.title || 'N/A'}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`text-xs ${notification.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                                {new Date(notification.createdAt).toLocaleString()}
                              </span>
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent nav on mark read
                                    handleMarkAsRead(notification._id);
                                  }}
                                  className="text-xs text-gray-600 hover:text-gray-800 mt-1 font-medium"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="px-4 py-2 text-center border-t border-gray-100">
                      <button 
                        onClick={() => { setShowNotifications(false); navigate('/admin/messages'); }}
                        className="text-sm text-[#05213C] hover:text-gray-700 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">BG</span>
                </div>
                <span className="hidden md:block">Bonnie Green</span>
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                    My Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faCog} className="mr-2" />
                    Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faEnvelopeOpen} className="mr-2" />
                    Messages
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faUserShield} className="mr-2" />
                    Support
                  </a>
                  <div className="border-t border-gray-100"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Post Details Modal */}
      <PostDetailsModal 
        post={selectedPost} 
        onClose={handleCloseModal}
        showEditButton={false}
      />
    </>
  );
}