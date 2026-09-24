/**
 * Assignment Model for LearnHub AI
 * Represents a course assignment for students.
 */
const mongoose = require('mongoose');

const rubricCriterionSchema = new mongoose.Schema({
  criterion: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  maxMarks: {
    type: Number,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: true });

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: [3, 'Title must be at least 3 characters'],
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    required: true,
    trim: true
  },
  deadline: {
    type: Date,
    required: true
  },
  maxMarks: {
    type: Number,
    required: true,
    min: [1, 'Maximum marks must be at least 1']
  },
  rubric: [rubricCriterionSchema],
  allowedFileTypes: {
    type: [String],
    default: ['.pdf', '.doc', '.docx', '.zip', '.txt', '.jpg', '.png']
  },
  maxFileSize: {
    type: Number,
    default: 10485760 // 10MB
  },
  maxFiles: {
    type: Number,
    default: 5
  },
  allowGithubUrl: {
    type: Boolean,
    default: true
  },
  allowDemoUrl: {
    type: Boolean,
    default: false
  },
  allowLateSubmission: {
    type: Boolean,
    default: false
  },
  latePenaltyPercent: {
    type: Number,
    default: 10 // % deducted per day late
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  submissionCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ course: 1, isPublished: 1 });
assignmentSchema.index({ deadline: 1 });
assignmentSchema.index({ module: 1 });

// Methods
assignmentSchema.methods.isOverdue = function() {
  return Date.now() > this.deadline.getTime();
};

assignmentSchema.methods.getTotalRubricMarks = function() {
  return this.rubric.reduce((acc, curr) => acc + (curr.maxMarks || 0), 0);
};

// Statics
assignmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).sort({ deadline: 1 });
};

assignmentSchema.statics.findUpcoming = function(courseId) {
  return this.find({
    course: courseId,
    isPublished: true,
    deadline: { $gt: new Date() }
  }).sort({ deadline: 1 });
};

assignmentSchema.statics.findOverdue = function(courseId) {
  return this.find({
    course: courseId,
    isPublished: true,
    deadline: { $lt: new Date() }
  }).sort({ deadline: -1 });
};

module.exports = mongoose.model('Assignment', assignmentSchema);
