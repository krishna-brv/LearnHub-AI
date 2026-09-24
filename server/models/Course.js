/**
 * Course Model
 * Central model for courses in LearnHub AI.
 */
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    minlength: [5, 'Course title must be at least 5 characters'],
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  thumbnail: {
    type: String
  },
  previewVideo: {
    type: String
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course must have an instructor']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Course must belong to a category']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'all_levels'],
      message: '{VALUE} is not a valid course level'
    },
    default: 'beginner'
  },
  language: {
    type: String,
    required: [true, 'Course language is required'],
    default: 'English',
    trim: true
  },
  prerequisites: [String],
  learningObjectives: {
    type: [String],
    validate: [v => v && v.length > 0, 'Course must have at least one learning objective']
  },
  tags: [String],
  estimatedDuration: {
    type: Number
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  totalModules: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    required: [true, 'Course status is required'],
    enum: {
      values: ['draft', 'submitted', 'under_review', 'changes_requested', 'approved', 'published', 'archived'],
      message: '{VALUE} is not a valid course status'
    },
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  completionCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  lastUpdatedContent: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ status: 1 });
courseSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { name: 'course_text_index' }
);
courseSchema.index({ status: 1, featured: 1, enrollmentCount: -1 });
courseSchema.index({ instructor: 1, status: 1 });

// Virtuals
courseSchema.virtual('completionRate').get(function() {
  return (this.completionCount / (this.enrollmentCount || 1)) * 100;
});

// Pre-save hook
courseSchema.pre('save', async function() {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Check if slug exists
    const slugExists = await mongoose.models.Course.findOne({ 
      slug: baseSlug, 
      _id: { $ne: this._id } 
    });

    if (slugExists) {
      const suffix = Math.random().toString(36).substring(2, 6);
      this.slug = `${baseSlug}-${suffix}`;
    } else {
      this.slug = baseSlug;
    }
  }
});

// Methods
courseSchema.methods.isOwnedBy = function(userId) {
  return this.instructor.toString() === userId.toString();
};

courseSchema.methods.canBeEditedBy = function(userId, userRole) {
  return this.isOwnedBy(userId) || userRole === 'admin';
};

courseSchema.methods.canBePublished = function() {
  return this.status === 'approved';
};

courseSchema.methods.canBeSubmitted = function() {
  return (this.status === 'draft' || this.status === 'changes_requested') && this.totalModules >= 1;
};

// Statics
courseSchema.statics.findPublished = function(filter = {}) {
  return this.find({ status: 'published', ...filter });
};

courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId });
};

courseSchema.statics.searchCourses = function(query) {
  return this.find(
    { $text: { $search: query }, status: 'published' },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Course', courseSchema);
