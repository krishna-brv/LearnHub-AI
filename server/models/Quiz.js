/**
 * Quiz Model for LearnHub AI
 * Represents a quiz assessment associated with a course, module, and optionally a lesson.
 */
const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
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
    trim: true,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxLength: [2000, 'Instructions cannot exceed 2000 characters']
  },
  timeLimit: {
    type: Number,
    default: 0 // minutes, 0 or null means unlimited
  },
  attemptLimit: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  passingScore: {
    type: Number,
    required: true,
    default: 60 // percentage
  },
  negativeMarking: {
    type: Boolean,
    default: false
  },
  negativeMarkValue: {
    type: Number,
    default: 0 // points deducted per wrong answer
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showExplanations: {
    type: Boolean,
    default: true
  },
  questionCount: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  availableFrom: {
    type: Date
  },
  availableUntil: {
    type: Date
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
quizSchema.index({ course: 1 });
quizSchema.index({ module: 1 });
quizSchema.index({ lesson: 1 });
quizSchema.index({ course: 1, isPublished: 1 });

// Statics
quizSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).populate('module').sort({ 'module.order': 1, createdAt: 1 });
};

quizSchema.statics.findPublishedByCourse = function(courseId) {
  return this.find({ course: courseId, isPublished: true });
};

module.exports = mongoose.model('Quiz', quizSchema);
