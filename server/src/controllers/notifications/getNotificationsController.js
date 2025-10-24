const Notification = require('../../models/Notification.js');

const getNotifications = async (req, res) => {
  try {
    const userID = req.user._id;

    // Fetch user's notifications, sorted by createdAt desc, populate related if needed
    const notifications = await Notification.find({ userID })
      .populate('relatedID', 'title') // Populate post title if related to post
      .sort({ createdAt: -1 })
      .limit(50) // Limit to recent 50
      .lean();

    // Count unread
    const unreadCount = await Notification.countDocuments({ userID, isRead: false });

    res.status(200).json({
      message: 'Notifications retrieved successfully',
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error during fetching notifications' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userID = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userID },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error during marking as read' });
  }
};

module.exports = { getNotifications, markAsRead };