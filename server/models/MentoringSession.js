/**
 * MentoringSession Model for LearnHub AI
 * Represents a specific scheduled session between a mentor and student.
 */
const mongoose = require('mongoose');

const mentoringSessionSchema = new mongoose.Schema({
  mentorAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorAssignment',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30
  },
  type: {
    type: String,
    enum: {
      values: ['one_on_one', 'review', 'goal_setting', 'progress_check', 'general'],
      message: '{VALUE} is not a valid session type'
    },
    default: 'one_on_one',
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'scheduled',
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  },
  studentFeedback: {
    type: String,
    trim: true,
    maxlength: [2000, 'Feedback cannot exceed 2000 characters']
  },
  actionItems: [{
    type: String,
    trim: true
  }],
  requestedBy: {
    type: String,
    enum: {
      values: ['mentor', 'student'],
      message: '{VALUE} is not valid for requestedBy'
    },
    required: true,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  cancelledReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mentoringSessionSchema.index({ mentorAssignment: 1 });
mentoringSessionSchema.index({ mentor: 1, scheduledAt: 1 });
mentoringSessionSchema.index({ student: 1, scheduledAt: 1 });
mentoringSessionSchema.index({ scheduledAt: 1, status: 1 });

mentoringSessionSchema.statics.findUpcoming = async function(userId) {
  return this.find({
    $or: [{ mentor: userId }, { student: userId }],
    scheduledAt: { $gte: new Date() },
    status: 'scheduled'
  }).sort({ scheduledAt: 1 });
};

mentoringSessionSchema.statics.findByAssignment = async function(assignmentId) {
  return this.find({ mentorAssignment: assignmentId })
    .sort({ scheduledAt: 1 });
};

module.exports = mongoose.model('MentoringSession', mentoringSessionSchema);
