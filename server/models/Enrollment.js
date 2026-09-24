/**
 * @fileoverview Enrollment model for LearnHub AI. Represents a student's enrollment in a course.
 */
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'completed', 'dropped'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active',
    trim: true
  },
  completedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date
  },
  source: {
    type: String,
    enum: {
      values: ['direct', 'recommended', 'search', 'shared'],
      message: '{VALUE} is not a valid source'
    },
    default: 'direct',
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// Statics
enrollmentSchema.statics.isEnrolled = async function(studentId, courseId) {
  const enrollment = await this.findOne({ student: studentId, course: courseId, status: 'active' });
  return !!enrollment;
};

enrollmentSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId }).populate('course');
};

enrollmentSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).populate('student');
};

enrollmentSchema.statics.getEnrollmentCount = function(courseId) {
  return this.countDocuments({ course: courseId, status: 'active' });
};

// Methods
enrollmentSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

enrollmentSchema.methods.drop = function() {
  this.status = 'dropped';
  return this.save();
};

module.exports = mongoose.model('Enrollment', enrollmentSchema);
