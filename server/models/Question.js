/**
 * Question Model for LearnHub AI
 * Represents a single question in a quiz.
 */
const mongoose = require('mongoose');

const questionTypes = ['mcq', 'multiple_select', 'true_false', 'fill_blank', 'short_answer', 'coding', 'scenario'];
const difficultyLevels = ['easy', 'medium', 'hard'];
const codeLanguages = ['javascript', 'python', 'java', 'cpp', 'sql'];

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  explanation: {
    type: String,
    trim: true
  }
}, { _id: true });

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    trim: true
  },
  expectedOutput: {
    type: String,
    trim: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: questionTypes,
      message: '{VALUE} is not a valid question type'
    }
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  options: [optionSchema],
  correctAnswer: {
    type: String,
    trim: true
  },
  acceptableAnswers: [{
    type: String,
    trim: true
  }],
  explanation: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    required: true,
    enum: {
      values: difficultyLevels,
      message: '{VALUE} is not a valid difficulty'
    },
    default: 'medium'
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  learningObjective: {
    type: String,
    trim: true
  },
  marks: {
    type: Number,
    required: true,
    default: 1,
    min: [0, 'Marks cannot be negative']
  },
  order: {
    type: Number,
    default: 0
  },
  isAIGenerated: {
    type: Boolean,
    default: false
  },
  aiPromptVersion: {
    type: String,
    trim: true
  },
  codeTemplate: {
    type: String,
    trim: true
  },
  codeSolution: {
    type: String,
    trim: true
  },
  codeLanguage: {
    type: String,
    enum: {
      values: codeLanguages,
      message: '{VALUE} is not a valid code language'
    }
  },
  testCases: [testCaseSchema],
  scenarioContext: {
    type: String,
    trim: true
  },
  hints: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
questionSchema.index({ quiz: 1, order: 1 });
questionSchema.index({ quiz: 1, topic: 1 });
questionSchema.index({ quiz: 1, difficulty: 1 });
questionSchema.index({ topic: 1 });

// Statics
questionSchema.statics.findByQuiz = function(quizId) {
  return this.find({ quiz: quizId }).sort({ order: 1 });
};

questionSchema.statics.getRandomized = async function(quizId, count) {
  return this.aggregate([
    { $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
    { $sample: { size: count } }
  ]);
};

questionSchema.statics.getTopicDistribution = async function(quizId) {
  return this.aggregate([
    { $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
    { $group: { _id: '$topic', count: { $sum: 1 }, totalMarks: { $sum: '$marks' } } }
  ]);
};

module.exports = mongoose.model('Question', questionSchema);
