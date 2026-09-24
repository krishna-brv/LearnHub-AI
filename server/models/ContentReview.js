/**
 * ContentReview Model for LearnHub AI
 * Represents a reviewer's workflow for course approval.
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: {
      values: ['suggestion', 'issue', 'praise', 'required_change'],
      message: '{VALUE} is not a valid comment type'
    },
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contentReviewSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'in_review', 'approved', 'rejected', 'changes_requested'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending',
    trim: true
  },
  comments: [commentSchema],
  checklist: {
    hasLearningObjectives: { type: Boolean, default: false },
    hasSufficientContent: { type: Boolean, default: false },
    hasAssessments: { type: Boolean, default: false },
    hasProperStructure: { type: Boolean, default: false },
    contentAccuracy: { type: Boolean, default: false },
    appropriateDifficulty: { type: Boolean, default: false },
    noOffensiveContent: { type: Boolean, default: false },
    properFormatting: { type: Boolean, default: false }
  },
  aiQualityScore: {
    overall: { type: Number },
    contentDepth: { type: Number },
    structureScore: { type: Number },
    assessmentCoverage: { type: Number },
    generatedAt: { type: Date }
  },
  overallRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewedAt: {
    type: Date
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Notes cannot exceed 5000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

contentReviewSchema.index({ course: 1, reviewer: 1 });
contentReviewSchema.index({ course: 1, status: 1 });
contentReviewSchema.index({ reviewer: 1, status: 1 });
contentReviewSchema.index({ status: 1, assignedAt: -1 });

contentReviewSchema.statics.findPendingReviews = async function() {
  return this.find({ status: { $in: ['pending', 'in_review'] } })
    .sort({ assignedAt: 1 })
    .populate('course', 'title')
    .populate('reviewer', 'name');
};

contentReviewSchema.statics.findByReviewer = async function(reviewerId) {
  return this.find({ reviewer: reviewerId })
    .sort({ assignedAt: -1 })
    .populate('course', 'title');
};

contentReviewSchema.statics.getReviewHistory = async function(courseId) {
  return this.find({ course: courseId })
    .sort({ createdAt: -1 })
    .populate('reviewer', 'name');
};

module.exports = mongoose.model('ContentReview', contentReviewSchema);
