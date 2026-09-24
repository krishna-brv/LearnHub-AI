/**
 * CourseReview Model for LearnHub AI
 * Represents student ratings and reviews for a course.
 */
const mongoose = require('mongoose');

const courseReviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [2000, 'Comment cannot exceed 2000 characters']
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isReported: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

courseReviewSchema.index({ student: 1, course: 1 }, { unique: true });
courseReviewSchema.index({ course: 1, isVisible: 1 });
courseReviewSchema.index({ course: 1, rating: 1 });

courseReviewSchema.statics.getAverageRating = async function(courseId) {
  const result = await this.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId), isVisible: true } },
    { $group: { _id: '$course', averageRating: { $avg: '$rating' } } }
  ]);
  return result.length > 0 ? result[0].averageRating : 0;
};

courseReviewSchema.statics.getRatingDistribution = async function(courseId) {
  return this.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId), isVisible: true } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);
};

courseReviewSchema.statics.findByCourse = async function(courseId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ course: courseId, isVisible: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('student', 'name avatar');
};

module.exports = mongoose.model('CourseReview', courseReviewSchema);
