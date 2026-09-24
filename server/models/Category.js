/**
 * Category Model
 * Represents course categories and subcategories in LearnHub AI.
 */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  icon: {
    type: String
  },
  color: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courseCount: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

// Virtuals
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save hook
categorySchema.pre('save', function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/[\s_-]+/g, '-') // replace spaces with hyphens
      .replace(/^-+|-+$/g, ''); // trim hyphens
  }
});

// Statics
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ order: 1 });
};

categorySchema.statics.getWithSubcategories = function() {
  return this.aggregate([
    { $match: { parent: null, isActive: true } },
    { $sort: { order: 1 } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parent',
        as: 'subcategories'
      }
    }
  ]);
};

module.exports = mongoose.model('Category', categorySchema);
