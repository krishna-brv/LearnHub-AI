/**
 * @fileoverview LearningActivity model for LearnHub AI. Tracks student activity events.
 */
const mongoose = require('mongoose');

const learningActivitySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  type: {
    type: String,
    required: [true, 'Activity type is required'],
    enum: {
      values: [
        'lesson_start', 'lesson_complete', 'quiz_attempt', 'quiz_complete', 
        'assignment_submit', 'ai_chat', 'note_created', 'focus_session', 
        'flashcard_review', 'discussion_post', 'login'
      ],
      message: '{VALUE} is not a valid activity type'
    },
    trim: true
  },
  duration: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
learningActivitySchema.index({ student: 1, date: 1 });
learningActivitySchema.index({ student: 1, type: 1, date: 1 });
learningActivitySchema.index({ course: 1, date: 1 });
learningActivitySchema.index({ date: 1 });

// Statics
learningActivitySchema.statics.logActivity = function(data) {
  return this.create(data);
};

learningActivitySchema.statics.getHeatmapData = async function(studentId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);
  
  return this.aggregate([
    { 
      $match: { 
        student: mongoose.Types.ObjectId(studentId),
        date: { $gte: startDate, $lt: endDate }
      } 
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
        totalDuration: { $sum: "$duration" },
        activities: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

learningActivitySchema.statics.getDailyStats = async function(studentId, targetDate) {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        date: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: "$type",
        totalDuration: { $sum: "$duration" },
        count: { $sum: 1 }
      }
    }
  ]);
};

learningActivitySchema.statics.getStudyStreak = async function(studentId) {
  const activities = await this.aggregate([
    { $match: { student: mongoose.Types.ObjectId(studentId) } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } } },
    { $sort: { _id: -1 } }
  ]);
  
  if (activities.length === 0) return 0;
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  const lastActiveDate = new Date(activities[0]._id);
  const diffDays = Math.floor((currentDate - lastActiveDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 1) return 0;
  
  let checkDate = new Date(activities[0]._id);
  for (let i = 0; i < activities.length; i++) {
    const actDate = new Date(activities[i]._id);
    if (actDate.getTime() === checkDate.getTime()) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

module.exports = mongoose.model('LearningActivity', learningActivitySchema);
