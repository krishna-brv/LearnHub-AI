/**
 * Certificate Model for LearnHub AI
 * Represents a completed course certificate.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
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
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  instructorName: {
    type: String,
    required: true,
    trim: true
  },
  completionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  verificationUrl: {
    type: String,
    trim: true
  },
  qrCode: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    enum: {
      values: ['distinction', 'merit', 'pass'],
      message: '{VALUE} is not a valid grade'
    },
    trim: true
  },
  masteryScore: {
    type: Number
  },
  isValid: {
    type: Boolean,
    default: true
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

certificateSchema.index({ student: 1 });
certificateSchema.index({ student: 1, course: 1 }, { unique: true });
certificateSchema.index({ isValid: 1 });

certificateSchema.statics.verify = async function(certificateId) {
  return this.findOne({ certificateId, isValid: true })
    .populate('student', 'name')
    .populate('course', 'title');
};

certificateSchema.statics.findByStudent = async function(studentId) {
  return this.find({ student: studentId });
};

certificateSchema.statics.generateCertificateId = function() {
  return crypto.randomUUID();
};

certificateSchema.methods.revoke = async function(reason) {
  this.isValid = false;
  this.revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

module.exports = mongoose.model('Certificate', certificateSchema);
