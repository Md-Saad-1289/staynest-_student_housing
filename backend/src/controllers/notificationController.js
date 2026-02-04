import Notification from '../models/Notification.js';

// Get user notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany({ userId, read: false }, { read: true, readAt: new Date() });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create notification (internal use)
export const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};
