const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const { getIO } = require('../config/socket');
const { transporter } = require('../config/email');
const User = require('../models/User');

class NotificationService {
  /**
   * Create & Dispatch Notification (In-App + Real-Time Socket + Email)
   */
  async notify({ user, type, title, message, data = {}, link = '', priority = 'medium', sendEmail = false }) {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      data,
      link,
      priority,
      isRead: false
    });

    // Dispatch Real-Time Socket.IO Notification if online
    try {
      const io = getIO();
      io.to(`user_${user.toString()}`).emit('new_notification', {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt
      });
    } catch (socketErr) {
      // Socket not initialized or client offline
    }

    // Send Email Notification if requested
    if (sendEmail) {
      try {
        const recipient = await User.findById(user);
        if (recipient && recipient.email && recipient.notificationPreferences?.email) {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'no-reply@learnhub.ai',
            to: recipient.email,
            subject: `LearnHub AI — ${title}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h3>${title}</h3>
                <p>${message}</p>
                ${link ? `<a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${link}" style="background-color: #00A76F; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">View Details</a>` : ''}
              </div>
            `
          });
          notification.isEmailed = true;
          notification.emailedAt = new Date();
          await notification.save();
        }
      } catch (emailErr) {
        console.warn('⚠️ Email notification delivery failed:', emailErr.message);
      }
    }

    return notification;
  }

  /**
   * Get User Notifications (Paginated)
   */
  async getUserNotifications(userId, queryParams) {
    const { page = 1, limit = 20, unreadOnly } = queryParams;

    const filter = { user: userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Mark Single Notification as Read
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found.', 404);
    }

    return notification;
  }

  /**
   * Mark All Notifications as Read
   */
  async markAllAsRead(userId) {
    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true, readAt: new Date() });
    return { message: 'All notifications marked as read.' };
  }
}

module.exports = new NotificationService();
