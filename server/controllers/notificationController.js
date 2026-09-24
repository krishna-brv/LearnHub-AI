const asyncHandler = require('../middleware/asyncHandler');
const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');

exports.getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user._id, req.query);
  return successResponse(res, 'Notifications fetched', {
    notifications: result.notifications,
    unreadCount: result.unreadCount
  }, 200, result.pagination);
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user._id, req.params.id);
  return successResponse(res, 'Notification marked as read', { notification });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  return successResponse(res, result.message);
});

exports.sendReminder = asyncHandler(async (req, res) => {
  const { studentId, courseId, customMessage } = req.body;
  if (!studentId) {
    return res.status(400).json({ success: false, message: 'Student ID is required' });
  }

  const message = customMessage || 'Your instructor sent a reminder to review course materials, practice quizzes, and stay on track with your learning goals!';

  const notification = await notificationService.notify({
    user: studentId,
    type: 'assignment',
    title: 'Study & Practice Reminder 📚',
    message,
    link: courseId ? `/learn/${courseId}` : '/my-courses',
    priority: 'high',
    sendEmail: true
  });

  return successResponse(res, 'Study reminder sent to student successfully', { notification });
});
