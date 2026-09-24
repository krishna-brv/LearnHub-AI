/**
 * Skill Model
 * Represents a node in the skill tree.
 */
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null
  },
  level: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  relatedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  prerequisiteSkills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
skillSchema.index({ category: 1, order: 1 });
skillSchema.index({ parent: 1 });
skillSchema.index({ isActive: 1 });

// Statics
skillSchema.statics.getTree = async function() {
  return this.aggregate([
    { $match: { isActive: true } },
    { $sort: { level: 1, order: 1 } },
    { 
      $group: {
        _id: '$parent',
        skills: { $push: '$$ROOT' }
      }
    }
  ]);
};

skillSchema.statics.getRootSkills = function() {
  return this.find({ parent: null, isActive: true })
    .sort({ order: 1 });
};

skillSchema.statics.getChildren = function(parentId) {
  return this.find({ parent: parentId, isActive: true })
    .sort({ order: 1 });
};

module.exports = mongoose.model('Skill', skillSchema);
