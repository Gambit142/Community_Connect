import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, markAsRead } from '../../store/notifications/notificationsSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

export default function Messages() {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const [selectedNotification, setSelectedNotification] = useState(null); // For modal if needed

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead({ _id: notificationId }));
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    handleMarkAsRead(notification._id);
    // Optional: Navigate based on type
  };

  if (loading) {
    return <div className="text-center py-4">Loading notifications...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">View all your notifications</p>
        </div>
        <div className="text-sm text-gray-500">
          {unreadCount} unread
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
  );
}