const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const LearningActivity = require('../models/LearningActivity');
const XPTransaction = require('../models/XPTransaction');
const AppError = require('../utils/AppError');

class EnrollmentService {
  /**
   * Enroll Student in Course (Instant & Free)
   */
  async enrollInCourse(studentId, courseId, source = 'direct') {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (course.status !== 'published') {
      throw new AppError('Cannot enroll in a course that is not published.', 400);
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      if (existingEnrollment.status === 'active') {
        throw new AppError('You are already enrolled in this course.', 400);
      } else if (existingEnrollment.status === 'dropped') {
        // Re-activate dropped enrollment
        existingEnrollment.status = 'active';
        existingEnrollment.enrolledAt = new Date();
        await existingEnrollment.save();
        return { message: 'Re-enrolled in course successfully!', enrollment: existingEnrollment };
      }
    }

    // Create Enrollment Record
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: 'active',
      source
    });

    // Create Progress Record
    await Progress.create({
      student: studentId,
      course: courseId,
      enrollment: enrollment._id,
      completedLessons: [],
      overallProgress: 0,
      masteryScore: 0
    });

    // Increment Course enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

    // Log Activity
    await LearningActivity.create({
      student: studentId,
      course: courseId,
      type: 'lesson_start',
      metadata: { action: 'enrolled' },
      date: new Date()
    });

    // Record daily study streak
    try {
      const studentUser = await User.findById(studentId);
      if (studentUser) await studentUser.recordDailyActivity();
    } catch (streakErr) {
      console.warn('⚠️ Could not update streak on enrollment:', streakErr.message);
    }

    // Award XP for course enrollment (50 XP bonus)
    try {
      await XPTransaction.addXP(
        studentId,
        50,
        'first_enrollment',
        `Enrolled in course: ${course.title}`,
        courseId,
        'Course',
        'Course enrollment XP bonus'
      );
    } catch (xpErr) {
      console.warn('⚠️ Could not award enrollment XP:', xpErr.message);
    }

    // Send In-App Notification
    try {
      const notificationService = require('./notificationService');
      await notificationService.notify({
        user: studentId,
        type: 'course',
        title: 'Course Enrollment Successful!',
        message: `You have successfully enrolled in "${course.title}". Start learning now!`,
        link: `/learn/${courseId}`,
        priority: 'medium'
      });
    } catch (notifErr) {
      console.warn('⚠️ Could not send enrollment notification:', notifErr.message);
    }

    return {
      message: 'Enrolled in course successfully!',
      enrollment
    };
  }

  /**
   * Get Student's Enrolled Courses with Progress
   */
  async getMyEnrollments(studentId, status = 'active') {
    const filter = { student: studentId };
    if (status && status !== 'all') {
      if (status === 'active') {
        filter.status = { $in: ['active', 'completed'] };
      } else {
        filter.status = status;
      }
    } else {
      filter.status = { $in: ['active', 'completed'] };
    }

    const enrollments = await Enrollment.find(filter)
      .populate({
        path: 'course',
        select: 'title slug thumbnail category level estimatedDuration totalLessons averageRating instructor',
        populate: [
          { path: 'category', select: 'name slug icon' },
          { path: 'instructor', select: 'firstName lastName profile.avatar' }
        ]
      })
      .sort({ lastAccessedAt: -1, enrolledAt: -1 });

    // Attach progress details with dynamic recalculation against live published lesson count
    const courseIds = enrollments.map((e) => e.course._id);
    const Lesson = require('../models/Lesson');
    const progressList = await Progress.find({ student: studentId, course: { $in: courseIds } });

    const result = await Promise.all(
      enrollments.map(async (e) => {
        const eObj = e.toObject();
        const prog = progressList.find((p) => p.course._id.toString() === e.course._id.toString());
        
        const totalLessons = await Lesson.countDocuments({ course: e.course._id, isPublished: true });
        let overallProgress = 0;
        let completedCount = 0;
        let masteryScore = 0;

        if (prog) {
          completedCount = prog.completedLessons ? prog.completedLessons.length : 0;
          overallProgress = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
          masteryScore = prog.masteryScore || 0;

          // Sync progress document and enrollment status if drifted
          if (prog.overallProgress !== overallProgress) {
            prog.overallProgress = overallProgress;
            await prog.save();

            if (overallProgress < 100 && e.status === 'completed') {
              await Enrollment.findByIdAndUpdate(e._id, { status: 'active' });
              eObj.status = 'active';
            }
          }
        }

        eObj.progress = {
          overallProgress,
          masteryScore,
          completedLessonsCount: completedCount,
          totalTimeSpent: prog ? prog.totalTimeSpent : 0,
          lastAccessedAt: prog ? prog.lastAccessedAt : null
        };
        return eObj;
      })
    );

    return result;
  }

  /**
   * Get Course Enrollments (Instructor / Admin)
   */
  async getCourseEnrollments(courseId, queryParams) {
    const { page = 1, limit = 20, status = 'active' } = queryParams;

    const filter = { course: courseId };
    if (status) filter.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(filter)
        .populate('student', 'firstName lastName email username profile.avatar studentProfile.careerGoal')
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Enrollment.countDocuments(filter)
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Drop / Unenroll Course
   */
  async unenroll(studentId, courseId) {
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      throw new AppError('Enrollment record not found.', 404);
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: -1 } });

    return { message: 'Unenrolled from course successfully.' };
  }
}

module.exports = new EnrollmentService();
