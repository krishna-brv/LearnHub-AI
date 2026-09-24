/**
 * QuizAttempt Model for LearnHub AI
 * Represents a student's attempt at a quiz.
 */
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  selectedOptions: [{
    type: Number
  }],
  textAnswer: {
    type: String,
    trim: true
  },
  codeAnswer: {
    type: String,
    trim: true
  },
  isCorrect: {
    type: Boolean
  },
  marksAwarded: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // seconds
  },
  answeredAt: {
    type: Date
  }
}, { _id: false });

const attemptStatuses = ['in_progress', 'submitted', 'timed_out', 'abandoned'];

const quizAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  answers: [answerSchema],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  topicScores: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  submittedAt: {
    type: Date
  },
  timeSpent: {
    type: Number,
    default: 0 // total seconds
  },
  status: {
    type: String,
    enum: {
      values: attemptStatuses,
      message: '{VALUE} is not a valid status'
    },
    default: 'in_progress'
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  autoSaved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, course: 1 });
quizAttemptSchema.index({ quiz: 1, status: 1 });
quizAttemptSchema.index({ student: 1, status: 1 });

// Methods
quizAttemptSchema.methods.saveAnswer = function(questionId, answerData) {
  const answerIndex = this.answers.findIndex(a => a.question.toString() === questionId.toString());
  if (answerIndex > -1) {
    Object.assign(this.answers[answerIndex], answerData);
    this.answers[answerIndex].answeredAt = new Date();
  } else {
    this.answers.push({
      ...answerData,
      question: questionId,
      answeredAt: new Date()
    });
  }
};

quizAttemptSchema.methods.calculateScore = function() {
  this.score = this.answers.reduce((acc, curr) => acc + (curr.marksAwarded || 0), 0);
  return this.score;
};

quizAttemptSchema.methods.submit = async function() {
  this.calculateScore();
  this.status = 'submitted';
  this.submittedAt = new Date();
  
  if (this.totalMarks > 0) {
    this.percentage = (this.score / this.totalMarks) * 100;
  }
  
  if (this.populated('quiz')) {
    this.passed = this.percentage >= this.quiz.passingScore;
  }
};

quizAttemptSchema.methods.isTimedOut = function(timeLimitMinutes) {
  if (!timeLimitMinutes || timeLimitMinutes <= 0) return false;
  const elapsedMinutes = (Date.now() - this.startedAt.getTime()) / 60000;
  return elapsedMinutes > timeLimitMinutes;
};

// Statics
quizAttemptSchema.statics.getAttemptCount = function(studentId, quizId) {
  return this.countDocuments({ student: studentId, quiz: quizId });
};

quizAttemptSchema.statics.getBestAttempt = function(studentId, quizId) {
  return this.findOne({ student: studentId, quiz: quizId, status: 'submitted' }).sort({ score: -1, timeSpent: 1 });
};

quizAttemptSchema.statics.getQuizAnalytics = async function(quizId) {
  return this.aggregate([
    { $match: { quiz: new mongoose.Types.ObjectId(quizId), status: 'submitted' } },
    { $group: {
      _id: '$quiz',
      averageScore: { $avg: '$score' },
      maxScore: { $max: '$score' },
      minScore: { $min: '$score' },
      totalAttempts: { $sum: 1 },
      passCount: {
        $sum: { $cond: [{ $eq: ['$passed', true] }, 1, 0] }
      }
    }},
    { $project: {
      _id: 1,
      averageScore: 1,
      maxScore: 1,
      minScore: 1,
      totalAttempts: 1,
      passRate: {
        $multiply: [{ $divide: ['$passCount', '$totalAttempts'] }, 100]
      }
    }}
  ]);
};

quizAttemptSchema.statics.getStudentQuizHistory = function(studentId, courseId) {
  return this.find({ student: studentId, course: courseId }).sort({ startedAt: -1 });
};

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
