/**
 * Feedback Model
 * Represents mentor feedback provided to a student.
 */
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentorAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorAssignment',
    required: true
  },
  type: {
    type: String,
    enum: {
      values: ['progress_review', 'performance', 'goal_related', 'general', 'encouragement'],
      message: '{VALUE} is not a valid feedback type'
    },
    default: 'general',
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  strengths: [{
    type: String,
    trim: true
  }],
  areasForImprovement: [{
    type: String,
    trim: true
  }],
  actionItems: [{
    type: String,
    trim: true
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
feedbackSchema.index({ to: 1, createdAt: -1 });
feedbackSchema.index({ mentorAssignment: 1 });
feedbackSchema.index({ from: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
