/**
 * MentorAssignment Model for LearnHub AI
 * Represents an assignment of a mentor to a student.
 */
const mongoose = require('mongoose');

const mentorAssignmentSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'paused', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active',
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

mentorAssignmentSchema.index({ mentor: 1, student: 1 });
mentorAssignmentSchema.index({ mentor: 1, status: 1 });
mentorAssignmentSchema.index({ student: 1, status: 1 });
mentorAssignmentSchema.index({ status: 1 });

mentorAssignmentSchema.statics.findByMentor = async function(mentorId) {
  return this.find({ mentor: mentorId, status: 'active' })
    .populate('student', 'name email avatar')
    .populate('course', 'title');
};

mentorAssignmentSchema.statics.findByStudent = async function(studentId) {
  return this.find({ student: studentId, status: 'active' })
    .populate('mentor', 'name email avatar')
    .populate('course', 'title');
};

mentorAssignmentSchema.statics.isAssigned = async function(mentorId, studentId) {
  const count = await this.countDocuments({ mentor: mentorId, student: studentId, status: 'active' });
  return count > 0;
};

module.exports = mongoose.model('MentorAssignment', mentorAssignmentSchema);
