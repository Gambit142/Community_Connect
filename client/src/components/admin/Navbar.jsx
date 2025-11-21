// src/components/Navbar.jsx
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
  faEnvelope,
  faHeadset,
  faSignOutAlt,
  faBars,
  faCheckCircle,
  faChevronDown,
  faUser,
  faMessage
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
  const profileRef = useRef(null);

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
        setShowNotifications(false);
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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Hamburger - ONLY visible on mobile */}
              <button 
                onClick={onMenuClick} 
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
              >
                <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
              </button>
              
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CC</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Notifications - Fixed alignment */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <FontAwesomeIcon icon={faBell} className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification._id);
                                  }}
                                  className="ml-3 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                                  title="Mark as read"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/admin/messages');
                        }}
                        className="w-full text-center py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {user?.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt="Admin" 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {user?.username?.[0]?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</span>
                    <span className="text-xs text-gray-500">Administrator</span>
                  </div>
                  <FontAwesomeIcon 
                    icon={faChevronDown} 
                    className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
                      showProfile ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {showProfile && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email || 'admin@communityconnect.com'}</p>
                    </div>
                    
                    <Link 
                      to="/admin/settings" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4 mr-3 text-gray-400" />
                      My Profile
                    </Link>
                    
                    <Link 
                      to="/admin/settings" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      <FontAwesomeIcon icon={faCog} className="w-4 h-4 mr-3 text-gray-400" />
                      Settings
                    </Link>
                    
                    <Link 
                      to="/admin/messages" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      <FontAwesomeIcon icon={faMessage} className="w-4 h-4 mr-3 text-gray-400" />
                      Messages
                    </Link>
                    
                    <Link 
                      to="/admin/support" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => setShowProfile(false)}
                    >
                      <FontAwesomeIcon icon={faHeadset} className="w-4 h-4 mr-3 text-gray-400" />
                      Support
                    </Link>

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button 
                        onClick={handleLogout} 
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
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