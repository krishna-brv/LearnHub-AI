/**
 * @fileoverview Lesson model for LearnHub AI. Represents a lesson within a module.
 */
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Lesson type is required'],
    enum: {
      values: ['video', 'text', 'markdown', 'pdf', 'external_resource', 'youtube', 'coding', 'interactive', 'practice', 'quiz'],
      message: '{VALUE} is not a valid lesson type'
    },
    trim: true
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    default: 0
  },
  duration: {
    type: Number,
    default: 0
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  content: {
    text: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    videoDuration: { type: Number },
    pdfUrl: { type: String, trim: true },
    externalUrl: { type: String, trim: true },
    externalTitle: { type: String, trim: true },
    codeTemplate: { type: String },
    codeSolution: { type: String, select: false },
    codeLanguage: {
      type: String,
      enum: {
        values: ['javascript', 'python', 'java', 'cpp', 'html', 'css', 'sql', 'typescript'],
        message: '{VALUE} is not a valid coding language'
      },
      trim: true
    },
    instructions: { type: String, trim: true },
    hints: [{ type: String, trim: true }],
    testCases: [{
      input: { type: String, trim: true },
      expectedOutput: { type: String, trim: true },
      isHidden: { type: Boolean, default: false }
    }]
  },
  resources: [{
    title: { type: String, required: [true, 'Resource title is required'], trim: true },
    url: { type: String, required: [true, 'Resource url is required'], trim: true },
    type: {
      type: String,
      enum: {
        values: ['pdf', 'link', 'file', 'code'],
        message: '{VALUE} is not a valid resource type'
      },
      trim: true
    },
    size: { type: Number }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1 });
lessonSchema.index({ course: 1, isPublished: 1 });

// Statics
lessonSchema.statics.findByModule = function(moduleId) {
  return this.find({ module: moduleId }).sort({ order: 1 });
};

lessonSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).sort({ module: 1, order: 1 });
};

lessonSchema.statics.getNextOrder = async function(moduleId) {
  const lastLesson = await this.findOne({ module: moduleId }).sort({ order: -1 });
  return lastLesson ? lastLesson.order + 1 : 0;
};

lessonSchema.statics.countByCourse = function(courseId) {
  return this.countDocuments({ course: courseId, isPublished: true });
};

module.exports = mongoose.model('Lesson', lessonSchema);
