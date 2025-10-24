const Notification = require('../../models/Notification.js');

const markAllAsRead = async (req, res) => {
  try {
    const userID = req.user._id;

    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { userID, isRead: false },
      { isRead: true }
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({
        message: 'No unread notifications to mark as read',
        updatedCount: 0,
      });
    }

    // Optionally refetch to return updated list, but for efficiency, just return count
    res.status(200).json({
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error during marking all as read' });
  }
};

module.exports = { markAllAsRead };