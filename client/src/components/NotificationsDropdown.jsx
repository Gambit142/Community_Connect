import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getNotifications, markAsReadThunk, markAllAsReadThunk } from '../store/notifications/notificationsSlice.js';

// SVG Icons
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Updated: Check icon for mark as read (bigger: w-5 h-5; thicker: strokeWidth=3)
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
  </svg>
);

export default function NotificationsDropdown({ isMobile = false }) {
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const user = useSelector((state) => state.login.user);
  const { notifications, unreadCount, loading, error: sliceError } = useSelector((state) => state.notifications);
  const dispatch = useDispatch();
  const notificationRef = useRef(null);

  // Fetch notifications when user is logged in
  useEffect(() => {
    console.log('NotificationsDropdown useEffect: Fetching notifications, user:', !!user); // DEBUG
    if (user) {
      dispatch(getNotifications());
    }
  }, [dispatch, user]);

  // Show slice errors temporarily
  useEffect(() => {
    if (sliceError) {
      setErrorMessage(sliceError);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  }, [sliceError]);

  const handleMarkAsRead = async (notificationId) => {
    console.log('Marking single as read:', notificationId); // DEBUG
    try {
      await dispatch(markAsReadThunk(notificationId)).unwrap();
      console.log('Single mark successful'); // DEBUG
    } catch (err) {
      console.error('Single mark failed:', err); // DEBUG
      setErrorMessage(err || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    console.log('Marking all as read'); // DEBUG
    try {
      await dispatch(markAllAsReadThunk()).unwrap();
      console.log('All mark successful'); // DEBUG
      await dispatch(getNotifications()); // Refetch to ensure sync
    } catch (err) {
      console.error('All mark failed:', err); // DEBUG
      setErrorMessage(err || 'Failed to mark all as read');
      return; // Don't close on error
    }
    setNotificationOpen(false);
  };

  const handleNotificationClick = async (notification) => {
    console.log('Notification clicked:', notification._id, 'isRead:', notification.isRead); // DEBUG
    if (!notification.isRead) {
      try {
        await dispatch(markAsReadThunk(notification._id)).unwrap();
        console.log('Click mark successful'); // DEBUG
      } catch (err) {
        console.error('Click mark failed:', err); // DEBUG
        setErrorMessage(err || 'Failed to mark as read');
        return; // Don't proceed on error
      }
    }
    // Stay open to show update—no close here. User can close manually.
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  console.log('NotificationsDropdown render: notifications length:', notifications.length, 'unreadCount:', unreadCount); // DEBUG

  if (!user) return null;

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Bell clicked, toggling notification open:', !isNotificationOpen); // DEBUG
          setNotificationOpen(!isNotificationOpen);
        }}
        className={`relative text-gray-600 hover:text-black focus:outline-none transition-colors duration-200 ${
          isMobile ? 'p-1' : ''
        }`}
        disabled={loading}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className={`absolute flex items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white ${
            isMobile ? '-top-1 -right-1 h-4 w-4' : '-top-0.5 -right-0.5 h-4 w-4'
          }`}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isNotificationOpen && (
        <>
          {errorMessage && (
            <div className="absolute right-0 mt-2 w-80 bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-md z-50 mb-2">
              {errorMessage}
            </div>
          )}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Marking...' : 'Mark all as read'}
                  </button>
                )}
              </div>
              {unreadNotifications.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {unreadNotifications.length} unread {unreadNotifications.length === 1 ? 'notification' : 'notifications'}
                </p>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 transition-all duration-200 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                          <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(notification.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleMarkAsRead(notification._id);
                            }}
                            className="ml-3 flex-shrink-0 p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                            title="Mark as read"
                            disabled={loading}
                          >
                            <CheckIcon />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <BellIcon />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="text-center">
                  <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={() => setNotificationOpen(false)}>
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}