/**
 * Notification Model
 * System notifications for users.
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: [
        'course', 'course_approved', 'course_rejected', 'course_changes_requested', 'course_update',
        'lesson', 'announcement', 'instructor_message',
        'assignment_deadline', 'assignment_graded', 'quiz', 'quiz_result',
        'certificate_generated', 'mentor_feedback', 'mentoring', 'new_message',
        'new_enrollment', 'streak_milestone', 'achievement_unlocked',
        'ai_recommendation', 'discussion_reply', 'goal_reminder', 'system'
      ],
      message: '{VALUE} is not a valid notification type'
    },
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Notification message cannot exceed 500 characters']
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  link: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isEmailed: {
    type: Boolean,
    default: false
  },
  emailedAt: {
    type: Date
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'medium',
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ createdAt: 1 }); 

// Statics
notificationSchema.statics.createNotification = async function(data) {
  return this.create(data);
};

notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, isRead: false });
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

notificationSchema.statics.findByUser = function(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

notificationSchema.statics.deleteOld = async function(days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return this.deleteMany({ createdAt: { $lt: cutoff } });
};

module.exports = mongoose.model('Notification', notificationSchema);
