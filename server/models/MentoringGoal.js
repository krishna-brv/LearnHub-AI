/**
 * MentoringGoal Model for LearnHub AI
 * Represents goals set during mentorship.
 */
const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  order: {
    type: Number,
    default: 0
  }
});

const mentoringGoalSchema = new mongoose.Schema({
  mentorAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorAssignment',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  targetDate: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['not_started', 'in_progress', 'completed', 'overdue', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'not_started',
    trim: true
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'medium',
    trim: true
  },
  milestones: [milestoneSchema],
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedAt: {
    type: Date
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mentoringGoalSchema.index({ mentorAssignment: 1 });
mentoringGoalSchema.index({ student: 1, status: 1 });
mentoringGoalSchema.index({ mentor: 1 });

mentoringGoalSchema.methods.updateProgress = async function() {
  if (this.milestones && this.milestones.length > 0) {
    const completed = this.milestones.filter(m => m.isCompleted).length;
    this.progress = Math.round((completed / this.milestones.length) * 100);
    
    if (this.progress === 100 && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    } else if (this.progress > 0 && this.progress < 100 && this.status === 'not_started') {
      this.status = 'in_progress';
    }
  }
  return this.save();
};

mentoringGoalSchema.methods.markComplete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress = 100;
  if (this.milestones) {
    this.milestones.forEach(m => {
      if (!m.isCompleted) {
        m.isCompleted = true;
        m.completedAt = new Date();
      }
    });
  }
  return this.save();
};

module.exports = mongoose.model('MentoringGoal', mentoringGoalSchema);
