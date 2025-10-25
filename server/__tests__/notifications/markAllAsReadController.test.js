const { markAllAsRead } = require('../../src/controllers/notifications/markAllAsReadController.js');
const Notification = require('../../src/models/Notification.js');

jest.mock('../../src/models/Notification.js');

describe('Mark All As Read Controller', () => {
  let req, res;
  const mockUserId = '607f1f77bcf86cd799439011';

  beforeEach(() => {
    req = {
      user: { _id: mockUserId }, // Authenticated user ID from middleware
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

  it('should successfully mark all unread notifications as read', async () => {
    const mockUpdateResult = { modifiedCount: 5 };
    Notification.updateMany.mockResolvedValue(mockUpdateResult);

    await markAllAsRead(req, res);

    expect(Notification.updateMany).toHaveBeenCalledWith(
      { userID: mockUserId, isRead: false },
      { isRead: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'All notifications marked as read',
        updatedCount: 5,
      })
    );
  });

  it('should return success if no unread notifications are found', async () => {
    const mockUpdateResult = { modifiedCount: 0 };
    Notification.updateMany.mockResolvedValue(mockUpdateResult);

    await markAllAsRead(req, res);

    expect(Notification.updateMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No unread notifications to mark as read',
        updatedCount: 0,
      })
    );
  });

  it('should handle server error during update', async () => {
    Notification.updateMany.mockRejectedValue(new Error('DB error'));

    await markAllAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Server error during marking all as read',
      })
    );
  });
});
