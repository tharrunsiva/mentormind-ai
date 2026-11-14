const { Notification } = require('../models');

// @desc    Get current user's notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    res.status(200).json({ success: true, unreadCount, notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ user: req.user.id }, { read: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    }

    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );

    res.status(200).json({ success: true, notification: notif });
  } catch (error) {
    next(error);
  }
};
