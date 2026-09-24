/**
 * AIAnalysis Model
 * Represents weakness detection, risk analysis, and performance analysis.
 */
const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['weakness', 'risk', 'performance', 'skill_gap'],
      message: '{VALUE} is not a valid analysis type'
    }
  },
  result: {
    type: mongoose.Schema.Types.Mixed
  },
  promptVersion: {
    type: String,
    required: [true, 'Prompt version is required']
  },
  model: {
    type: String,
    required: [true, 'Model is required']
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  isLatest: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiAnalysisSchema.index({ user: 1, type: 1, isLatest: 1 });
aiAnalysisSchema.index({ user: 1, course: 1, type: 1 });
aiAnalysisSchema.index({ validUntil: 1 });

// Pre-save hook to ensure only one latest analysis per user+type
aiAnalysisSchema.pre('save', async function(next) {
  if (this.isNew && this.isLatest) {
    const query = { user: this.user, type: this.type };
    if (this.course) {
      query.course = this.course;
    }
    await this.constructor.updateMany(
      query,
      { $set: { isLatest: false } }
    );
  }
  next();
});

// Statics
aiAnalysisSchema.statics.findLatest = function(userId, type, courseId) {
  const query = { user: userId, type: type, isLatest: true };
  if (courseId) {
    query.course = courseId;
  }
  return this.findOne(query);
};

aiAnalysisSchema.statics.findHistory = function(userId, type) {
  return this.find({ user: userId, type: type }).sort({ generatedAt: -1 });
};

aiAnalysisSchema.statics.getAtRiskStudents = function(courseId) {
  return this.find({
    course: courseId,
    type: 'risk',
    isLatest: true,
    'result.riskLevel': 'high'
  }).populate('user', 'name email');
};

module.exports = mongoose.model('AIAnalysis', aiAnalysisSchema);
