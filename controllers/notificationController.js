
const { Notification, User } = require('../models');
const { validateNotification } = require('../validations');

class NotificationController {
  // Get user notifications
  static async getUserNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const { isRead } = req.query;

      const filter = { userId: req.user.id };
      if (isRead !== undefined) {
        filter.isRead = isRead === 'true';
      }

      const notifications = await Notification.find(filter)
        .populate('relatedOrderId', 'orderNumber status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Notification.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications',
        error: error.message
      });
    }
  }

  // Get unread notification count
  static async getUnreadCount(req, res) {
    try {
      const count = await Notification.countDocuments({
        userId: req.user.id,
        isRead: false
      });

      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching unread count',
        error: error.message
      });
    }
  }

  // Mark notification as read
  static async markAsRead(req, res) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating notification',
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req, res) {
    try {
      await Notification.updateMany(
        { userId: req.user.id, isRead: false },
        { isRead: true }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating notifications',
        error: error.message
      });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting notification',
        error: error.message
      });
    }
  }

  // Create notification (Admin only)
  static async createNotification(req, res) {
    try {
      const { error } = validateNotification(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { title, message, type, userId, broadcast } = req.body;

      if (broadcast) {
        // Send to all users
        const users = await User.find({ isActive: true }, '_id');
        const notifications = users.map(user => ({
          userId: user._id,
          title,
          message,
          type
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
          success: true,
          message: `Broadcast notification sent to ${users.length} users`
        });
      } else if (userId) {
        // Send to specific user
        const notification = new Notification({
          userId,
          title,
          message,
          type
        });

        await notification.save();

        res.status(201).json({
          success: true,
          message: 'Notification created successfully',
          data: notification
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either userId or broadcast must be specified'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating notification',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
