import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
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
  const notificationsRef = useRef(null);

  const user = useSelector((state) => state.profile.user || state.login.user);

  useEffect(() => {
    if (token) {
      dispatch(getNotifications());
    }
  }, [dispatch, token]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await dispatch(markAsReadThunk(notificationId)).unwrap();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.relatedType === 'post' && notification.relatedID) {
      try {
        const result = await dispatch(getPostById(notification.relatedID._id)).unwrap();
        setSelectedPost(result.post);
        setShowPostModal(true);
      } catch (err) {
        console.error('Failed to fetch post:', err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
    dispatch(clearCurrentPost());
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button onClick={onMenuClick} className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900">
                <FontAwesomeIcon icon={faBars} className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900"
                >
                  <FontAwesomeIcon icon={faBell} className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-gray-500">No notifications</p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                              </div>
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification._id);
                                  }}
                                  className="ml-3 text-blue-600 hover:text-blue-800"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-2 text-center border-t border-gray-100">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/messages');
                        }}
                        className="text-sm text-[#05213C] hover:text-gray-700 font-medium"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-3 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {user?.profilePic ? (
                    <img src={user.profilePic} alt="Admin" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.username?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block">{user?.username || 'Admin'}</span>
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link to="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                      My Profile
                    </Link>
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
        </div>
      </header>

      <PostDetailsModal
        post={selectedPost}
        onClose={handleCloseModal}
        showEditButton={false}
      />
    </>
  );
}