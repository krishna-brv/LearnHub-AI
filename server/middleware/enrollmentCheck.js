const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * Check if the student is enrolled in the course (or is instructor/admin)
 * @param {string} [courseParam='courseId'] - Parameter name for course ID in req.params or req.body
 */
const checkEnrollment = (courseParam = 'courseId') => {
  return asyncHandler(async (req, res, next) => {
    // Platform Admin bypasses enrollment check
    if (req.user.role === 'admin') {
      return next();
    }

    const courseId = req.params[courseParam] || req.body[courseParam] || req.query[courseParam];
    if (!courseId) {
      return next(new AppError(`Course ID parameter '${courseParam}' is missing.`, 400));
    }

    // Check if user is the instructor of the course
    const course = await Course.findById(courseId);
    if (!course) {
      return next(new AppError('Course not found.', 404));
    }

    if (course.instructor.toString() === req.user._id.toString()) {
      return next(); // Course instructor has full access
    }

    // Check active enrollment for student
    const isEnrolled = await Enrollment.exists({
      student: req.user._id,
      course: courseId,
      status: { $in: ['active', 'completed'] }
    });

    if (!isEnrolled) {
      return next(new AppError('You must be enrolled in this course to access its content.', 403));
    }

    next();
  });
};

module.exports = {
  checkEnrollment
};
