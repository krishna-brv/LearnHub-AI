/**
 * Submission Model for LearnHub AI
 * Represents a student's submission for an assignment.
 */
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  size: {
    type: Number
  },
  mimeType: {
    type: String,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const rubricScoreSchema = new mongoose.Schema({
  criterion: {
    type: String,
    trim: true
  },
  marksAwarded: {
    type: Number
  },
  maxMarks: {
    type: Number
  },
  feedback: {
    type: String,
    trim: true
  }
}, { _id: true });

const previousSubmissionSchema = new mongoose.Schema({
  files: [fileSchema],
  githubUrl: {
    type: String,
    trim: true
  },
  demoUrl: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date
  }
}, { _id: true });

const submissionStatuses = ['submitted', 'under_review', 'graded', 'returned', 'resubmitted'];

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  files: [fileSchema],
  githubUrl: {
    type: String,
    trim: true
  },
  demoUrl: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true,
    maxLength: [2000, 'Comments cannot exceed 2000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isLate: {
    type: Boolean,
    default: false
  },
  lateDays: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: submissionStatuses,
      message: '{VALUE} is not a valid submission status'
    },
    default: 'submitted'
  },
  grade: {
    type: Number
  },
  percentage: {
    type: Number
  },
  rubricScores: [rubricScoreSchema],
  feedback: {
    type: String,
    trim: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date
  },
  aiFeedback: {
    strengths: [{ type: String, trim: true }],
    weaknesses: [{ type: String, trim: true }],
    suggestions: [{ type: String, trim: true }],
    overallComment: { type: String, trim: true },
    generatedAt: { type: Date },
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  resubmissionCount: {
    type: Number,
    default: 0
  },
  previousSubmissions: [previousSubmissionSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, course: 1 });
submissionSchema.index({ assignment: 1, status: 1 });
submissionSchema.index({ course: 1 });

// Methods
submissionSchema.methods.isGraded = function() {
  return this.status === 'graded';
};

submissionSchema.methods.calculatePercentage = function() {
  if (this.populated('assignment') && this.assignment.maxMarks > 0) {
    this.percentage = (this.grade / this.assignment.maxMarks) * 100;
  }
  return this.percentage;
};

submissionSchema.methods.markAsGraded = function(grade, feedback, gradedBy) {
  this.status = 'graded';
  this.grade = grade;
  this.feedback = feedback;
  this.gradedBy = gradedBy;
  this.gradedAt = new Date();
  this.calculatePercentage();
};

// Statics
submissionSchema.statics.findByAssignment = function(assignmentId) {
  return this.find({ assignment: assignmentId }).populate('student');
};

submissionSchema.statics.findByStudent = function(studentId, courseId) {
  const query = { student: studentId };
  if (courseId) {
    query.course = courseId;
  }
  return this.find(query).sort({ submittedAt: -1 });
};

submissionSchema.statics.hasSubmitted = async function(studentId, assignmentId) {
  const count = await this.countDocuments({ student: studentId, assignment: assignmentId });
  return count > 0;
};

module.exports = mongoose.model('Submission', submissionSchema);
