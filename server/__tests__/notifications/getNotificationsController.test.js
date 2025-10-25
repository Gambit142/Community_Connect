const { getNotifications, markAsRead } = require('../../src/controllers/notifications/getNotificationsController.js');
const Notification = require('../../src/models/Notification.js');

jest.mock('../../src/models/Notification.js');

describe('Notification Controllers', () => {
  let req, res;
  const mockUserId = '607f1f77bcf86cd799439011';
  const mockNotificationId = '507f1f77bcf86cd799439022';

  beforeEach(() => {
    req = {
      user: { _id: mockUserId }, // Authenticated user ID from middleware
      params: { notificationId: mockNotificationId },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getNotifications', () => {
    // Helper to mock the full Mongoose chain for find
    const mockMongooseChain = (mockNotifications) => {
      const mockLean = jest.fn(() => Promise.resolve(mockNotifications));
      const mockLimit = { lean: mockLean };
      const mockSort = { limit: jest.fn(() => mockLimit) };
      const mockPopulate = { sort: jest.fn(() => mockSort) };
      Post.find.mockReturnValue({
        populate: jest.fn(() => mockPopulate)
      });
      return { mockPopulate, mockSort, mockLimit, mockLean };
    };

    it('should return user notifications and unread count', async () => {
      const mockNotifications = [
        { _id: '1', message: 'New post approved', isRead: false },
        { _id: '2', message: 'Other notification', isRead: true },
      ];
      const mockUnreadCount = 1;

      // Mock find chain
      const mockLean = jest.fn(() => Promise.resolve(mockNotifications));
      const mockLimit = { lean: mockLean };
      const mockSort = { limit: jest.fn(() => mockLimit) };
      const mockPopulate = { sort: jest.fn(() => mockSort) };
      Notification.find.mockReturnValue({
        populate: jest.fn(() => mockPopulate)
      });
      
      Notification.countDocuments.mockResolvedValue(mockUnreadCount);

      await getNotifications(req, res);

      // 1. Check find query
      expect(Notification.find).toHaveBeenCalledWith({ userID: mockUserId });
      expect(Notification.find().populate).toHaveBeenCalledWith('relatedID', 'title');
      expect(Notification.find().populate().sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(Notification.find().populate().sort().limit).toHaveBeenCalledWith(50);
      expect(mockLean).toHaveBeenCalled();
      
      // 2. Check count query
      expect(Notification.countDocuments).toHaveBeenCalledWith({ userID: mockUserId, isRead: false });

      // 3. Check response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Notifications retrieved successfully',
          notifications: mockNotifications,
          unreadCount: mockUnreadCount,
        })
      );
    });

    it('should handle server error', async () => {
      Notification.find.mockImplementation(() => {
        throw new Error('DB error');
      });

      await getNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error during fetching notifications',
        })
      );
    });
  });

  describe('markAsRead', () => {
    it('should successfully mark a specific notification as read', async () => {
      const mockUpdatedNotification = {
        _id: mockNotificationId,
        userID: mockUserId,
        isRead: true,
      };

      Notification.findOneAndUpdate.mockResolvedValue(mockUpdatedNotification);

      await markAsRead(req, res);

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockNotificationId, userID: mockUserId },
        { isRead: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Notification marked as read',
          notification: mockUpdatedNotification,
        })
      );
    });

    it('should return 404 if notification is not found for the user', async () => {
      Notification.findOneAndUpdate.mockResolvedValue(null);

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Notification not found',
        })
      );
    });

    it('should handle server error during update', async () => {
      Notification.findOneAndUpdate.mockRejectedValue(new Error('DB error'));

      await markAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Server error during marking as read',
        })
      );
    });
  });
});
