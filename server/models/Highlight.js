/**
 * Highlight Model
 * In-lesson text highlights.
 */
const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  selectedText: {
    type: String,
    required: true,
    maxlength: [2000, 'Highlight text cannot exceed 2000 characters']
  },
  color: {
    type: String,
    enum: {
      values: ['yellow', 'green', 'blue', 'pink', 'orange'],
      message: '{VALUE} is not a valid color'
    },
    default: 'yellow',
    trim: true
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  },
  startOffset: {
    type: Number
  },
  endOffset: {
    type: Number
  },
  blockId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
highlightSchema.index({ user: 1, lesson: 1 });
highlightSchema.index({ user: 1, course: 1 });

// Statics
highlightSchema.statics.findByLesson = function(userId, lessonId) {
  return this.find({ user: userId, lesson: lessonId });
};

highlightSchema.statics.findByCourse = function(userId, courseId) {
  return this.find({ user: userId, course: courseId });
};

module.exports = mongoose.model('Highlight', highlightSchema);
