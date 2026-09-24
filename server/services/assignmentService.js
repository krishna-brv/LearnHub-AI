const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

class AssignmentService {
  /**
   * Get Assignments for a Course
   */
  async getCourseAssignments(courseId, user) {
    const filter = { course: courseId };
    const isInstructorOrAdmin = user && ['instructor', 'admin'].includes(user.role);

    if (!isInstructorOrAdmin) {
      filter.isPublished = true;
    }

    const assignments = await Assignment.find(filter)
      .populate('createdBy', 'firstName lastName profile.avatar')
      .sort({ deadline: 1 });

    return assignments;
  }

  /**
   * Get Assignment Details by ID
   */
  async getAssignmentById(assignmentId, user) {
    const assignment = await Assignment.findById(assignmentId)
      .populate('course', 'title instructor')
      .populate('module', 'title');

    if (!assignment) {
      throw new AppError('Assignment not found.', 404);
    }

    const isOwnerOrAdmin = user && (assignment.createdBy.toString() === user._id.toString() || user.role === 'admin');

    if (!assignment.isPublished && !isOwnerOrAdmin) {
      throw new AppError('This assignment is not available.', 403);
    }

    return assignment;
  }

  /**
   * Create Assignment (Instructor)
   */
  async createAssignment(creatorId, data) {
    const {
      course,
      module,
      title,
      description,
      instructions,
      deadline,
      maxMarks,
      rubric,
      allowedFileTypes,
      maxFileSize,
      allowGithubUrl,
      allowDemoUrl,
      allowLateSubmission,
      latePenaltyPercent,
      isPublished
    } = data;

    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      throw new AppError('Course not found.', 404);
    }

    const assignment = await Assignment.create({
      course,
      module: module || null,
      title,
      description: description || '',
      instructions,
      deadline,
      maxMarks,
      rubric: rubric || [],
      allowedFileTypes: allowedFileTypes || ['.pdf', '.zip', '.txt', '.docx', '.jpg', '.png'],
      maxFileSize: maxFileSize || 10485760,
      allowGithubUrl: allowGithubUrl !== undefined ? allowGithubUrl : true,
      allowDemoUrl: allowDemoUrl !== undefined ? allowDemoUrl : false,
      allowLateSubmission: allowLateSubmission || false,
      latePenaltyPercent: latePenaltyPercent || 10,
      isPublished: isPublished || false,
      createdBy: creatorId
    });

    return assignment;
  }

  /**
   * Update Assignment
   */
  async updateAssignment(assignmentId, userId, userRole, data) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found.', 404);
    }

    if (assignment.createdBy.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Unauthorized to update this assignment.', 403);
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(assignmentId, { $set: data }, { new: true, runValidators: true });
    return updatedAssignment;
  }

  /**
   * Delete Assignment
   */
  async deleteAssignment(assignmentId, userId, userRole) {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found.', 404);
    }

    if (assignment.createdBy.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Unauthorized to delete this assignment.', 403);
    }

    await Assignment.findByIdAndDelete(assignmentId);
    return { message: 'Assignment deleted successfully.' };
  }
}

module.exports = new AssignmentService();
