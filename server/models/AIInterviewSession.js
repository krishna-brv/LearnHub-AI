/**
 * AIInterviewSession Model
 * Represents a mock interview session driven by AI.
 */
const mongoose = require('mongoose');

const aiInterviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  jobRole: {
    type: String,
    required: [true, 'Job role is required'],
    trim: true
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced'],
      message: '{VALUE} is not a valid difficulty'
    }
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: {
      values: ['technical', 'behavioral', 'hr', 'mixed', 'dsa', 'system_design'],
      message: '{VALUE} is not a valid interview type'
    }
  },
  questions: [{
    text: { type: String, required: true },
    category: String,
    difficulty: String,
    order: Number,
    expectedAnswer: String,
    hints: [String]
  }],
  answers: [{
    questionIndex: { type: Number, required: true },
    answer: { type: String, required: true },
    answeredAt: { type: Date, default: Date.now },
    evaluation: {
      score: { type: Number, min: 0, max: 10 },
      feedback: String,
      strengths: [String],
      weaknesses: [String],
      idealAnswer: String
    }
  }],
  evaluation: {
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    accuracyScore: Number,
    confidenceScore: Number,
    strengths: [String],
    weaknesses: [String],
    recommendedTopics: [String],
    overallFeedback: String,
    hireRecommendation: {
      type: String,
      enum: ['strong_yes', 'yes', 'maybe', 'no', 'strong_no']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['in_progress', 'completed', 'abandoned'],
      message: '{VALUE} is not a valid status'
    },
    default: 'in_progress'
  },
  totalQuestions: {
    type: Number,
    default: 10
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  promptVersion: {
    type: String,
    required: [true, 'Prompt version is required']
  },
  model: {
    type: String,
    required: [true, 'Model is required']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
aiInterviewSessionSchema.index({ user: 1, createdAt: -1 });
aiInterviewSessionSchema.index({ user: 1, status: 1 });
aiInterviewSessionSchema.index({ user: 1, jobRole: 1 });

// Methods
aiInterviewSessionSchema.methods.addAnswer = function(questionIndex, answer, evaluation) {
  this.answers.push({
    questionIndex,
    answer,
    evaluation
  });
  this.currentQuestionIndex += 1;
  return this;
};

aiInterviewSessionSchema.methods.complete = function(overallEvaluation) {
  this.evaluation = overallEvaluation;
  this.status = 'completed';
  this.completedAt = new Date();
  
  if (this.startedAt && this.completedAt) {
    this.timeSpent = Math.floor((this.completedAt - this.startedAt) / 1000);
  }
  return this;
};

aiInterviewSessionSchema.methods.isComplete = function() {
  return this.answers.length >= this.totalQuestions;
};

// Statics
aiInterviewSessionSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

aiInterviewSessionSchema.statics.findInProgress = function(userId) {
  return this.find({ user: userId, status: 'in_progress' }).sort({ createdAt: -1 });
};

aiInterviewSessionSchema.statics.getHistory = function(userId, jobRole) {
  const query = { user: userId, status: 'completed' };
  if (jobRole) {
    query.jobRole = jobRole;
  }
  return this.find(query).sort({ completedAt: -1 });
};

module.exports = mongoose.model('AIInterviewSession', aiInterviewSessionSchema);
