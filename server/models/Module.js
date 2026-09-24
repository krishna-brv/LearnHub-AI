/**
 * @fileoverview Module model for LearnHub AI. Represents a module within a course.
 */
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  order: {
    type: Number,
    required: [true, 'Order is required'],
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
moduleSchema.index({ course: 1, order: 1 });
moduleSchema.index({ course: 1 });

// Statics
moduleSchema.statics.findByCourse = function(courseId) {
  return this.find({ course: courseId }).sort({ order: 1 });
};

moduleSchema.statics.getNextOrder = async function(courseId) {
  const lastModule = await this.findOne({ course: courseId }).sort({ order: -1 });
  return lastModule ? lastModule.order + 1 : 0;
};

module.exports = mongoose.model('Module', moduleSchema);
