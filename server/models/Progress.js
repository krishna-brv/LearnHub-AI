/**
 * @fileoverview Progress model for LearnHub AI. Tracks a student's progress in a course.
 */
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: [true, 'Enrollment reference is required']
  },
  completedLessons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  lessonProgress: [{
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    status: {
      type: String,
      enum: {
        values: ['not_started', 'in_progress', 'completed'],
        message: '{VALUE} is not a valid lesson status'
      },
      trim: true
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date
    },
    lastAccessedAt: {
      type: Date
    },
    attempts: {
      type: Number,
      default: 0
    }
  }],
  moduleProgress: [{
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module'
    },
    completedLessons: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    }
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  masteryScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date
  },
  lastCompletedLesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  quizAverage: {
    type: Number,
    default: 0
  },
  assignmentAverage: {
    type: Number,
    default: 0
  },
  totalQuizzesTaken: {
    type: Number,
    default: 0
  },
  totalAssignmentsSubmitted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
progressSchema.index({ student: 1, course: 1 }, { unique: true });
progressSchema.index({ student: 1 });
progressSchema.index({ course: 1 });

// Methods
progressSchema.methods.markLessonComplete = function(lessonId, totalLessons) {
  if (!this.completedLessons.includes(lessonId)) {
    this.completedLessons.push(lessonId);
  }
  
  const lessonProg = this.lessonProgress.find(lp => lp.lesson.toString() === lessonId.toString());
  if (lessonProg) {
    lessonProg.status = 'completed';
    lessonProg.completedAt = new Date();
  } else {
    this.lessonProgress.push({
      lesson: lessonId,
      status: 'completed',
      completedAt: new Date()
    });
  }
  
  this.lastCompletedLesson = lessonId;
  if (totalLessons) {
    this.calculateOverallProgress(totalLessons);
  }
};

progressSchema.methods.calculateOverallProgress = function(totalLessons) {
  if (totalLessons > 0) {
    this.overallProgress = (this.completedLessons.length / totalLessons) * 100;
  }
  return this.overallProgress;
};

progressSchema.methods.calculateMasteryScore = function() {
  const completionWeight = 0.4;
  const quizWeight = 0.3;
  const assignmentWeight = 0.3;

  this.masteryScore = (this.overallProgress * completionWeight) +
                      (this.quizAverage * quizWeight) +
                      (this.assignmentAverage * assignmentWeight);
  
  return this.masteryScore;
};

progressSchema.methods.updateTimeSpent = function(seconds) {
  this.totalTimeSpent += seconds;
};

// Statics
progressSchema.statics.findByStudentAndCourse = function(studentId, courseId) {
  return this.findOne({ student: studentId, course: courseId });
};

progressSchema.statics.getStudentOverallProgress = async function(studentId) {
  const progresses = await this.find({ student: studentId });
  if (progresses.length === 0) return 0;
  
  const sum = progresses.reduce((acc, curr) => acc + curr.overallProgress, 0);
  return sum / progresses.length;
};

module.exports = mongoose.model('Progress', progressSchema);
