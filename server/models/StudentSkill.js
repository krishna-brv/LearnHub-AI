/**
 * StudentSkill Model
 * Represents a student's progress on a specific skill.
 */
const mongoose = require('mongoose');

const studentSkillSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['locked', 'learning', 'mastered'],
      message: '{VALUE} is not a valid status'
    },
    default: 'locked',
    trim: true
  },
  masteryLevel: {
    type: Number,
    default: 0,
    min: [0, 'Mastery level cannot be less than 0'],
    max: [100, 'Mastery level cannot exceed 100']
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  quizzesPassed: {
    type: Number,
    default: 0
  },
  lastAssessedAt: {
    type: Date
  },
  unlockedAt: {
    type: Date
  },
  masteredAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
studentSkillSchema.index({ student: 1, skill: 1 }, { unique: true });
studentSkillSchema.index({ student: 1, status: 1 });
studentSkillSchema.index({ student: 1, masteryLevel: -1 });

// Methods
studentSkillSchema.methods.unlock = async function() {
  if (this.status === 'locked') {
    this.status = 'learning';
    this.unlockedAt = new Date();
    await this.save();
  }
  return this;
};

studentSkillSchema.methods.updateMastery = async function(newLevel) {
  this.masteryLevel = Math.min(100, Math.max(0, newLevel));
  this.lastAssessedAt = new Date();
  
  if (this.masteryLevel >= 80 && this.status !== 'mastered') {
    this.status = 'mastered';
    this.masteredAt = new Date();
  }
  
  await this.save();
  return this;
};

// Statics
studentSkillSchema.statics.findByStudent = function(studentId) {
  return this.find({ student: studentId }).populate('skill');
};

studentSkillSchema.statics.getStudentSkillTree = async function(studentId) {
  return this.aggregate([
    { $match: { student: new mongoose.Types.ObjectId(studentId) } },
    { $lookup: { from: 'skills', localField: 'skill', foreignField: '_id', as: 'skillDetails' } },
    { $unwind: '$skillDetails' },
    { $sort: { 'skillDetails.level': 1, 'skillDetails.order': 1 } }
  ]);
};

module.exports = mongoose.model('StudentSkill', studentSkillSchema);
