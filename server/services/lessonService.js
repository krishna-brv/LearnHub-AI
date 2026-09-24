const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const LearningActivity = require('../models/LearningActivity');
const AppError = require('../utils/AppError');

class LessonService {
  /**
   * Get Lessons for a Module
   */
  async getModuleLessons(moduleId) {
    const lessons = await Lesson.find({ module: moduleId }).sort({ order: 1 });
    return lessons;
  }

  /**
   * Get Lesson Details (Content Delivery with Auth/Enrollment Check)
   */
  async getLessonDetails(lessonId, user) {
    const lesson = await Lesson.findById(lessonId).populate('course', 'title instructor status');
    if (!lesson) {
      throw new AppError('Lesson not found.', 404);
    }

    const isInstructor = user && (lesson.course.instructor.toString() === user._id.toString() || user.role === 'admin');

    // Check free preview or student enrollment
    if (!lesson.isPreview && !isInstructor) {
      if (!user) {
        throw new AppError('Authentication required to access this lesson.', 401);
      }

      const isEnrolled = await Enrollment.exists({
        student: user._id,
        course: lesson.course._id,
        status: { $in: ['active', 'completed'] }
      });

      if (!isEnrolled) {
        throw new AppError('You must be enrolled in this course to view this lesson.', 403);
      }
    }

    const lessonObj = lesson.toObject();

    // Hide codeSolution from students unless they are instructor/admin
    if (!isInstructor && lessonObj.content && lessonObj.content.codeSolution) {
      delete lessonObj.content.codeSolution;
    }

    return lessonObj;
  }

  /**
   * Create Lesson in Module
   */
  async createLesson(courseId, moduleId, data) {
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      throw new AppError('Module not found.', 404);
    }

    const maxOrder = await Lesson.findOne({ module: moduleId }).sort({ order: -1 });
    const nextOrder = data.order !== undefined ? data.order : (maxOrder ? maxOrder.order + 1 : 0);

    let contentObj = {};
    if (typeof data.content === 'object' && data.content !== null) {
      contentObj = data.content;
    } else {
      contentObj = {
        text: typeof data.content === 'string' ? data.content : '',
        videoUrl: data.videoUrl || ''
      };
    }

    const lesson = await Lesson.create({
      course: courseId,
      module: moduleId,
      title: data.title,
      description: data.description || '',
      type: data.type,
      duration: data.duration || 10,
      order: nextOrder,
      isPreview: data.isPreview || data.isFreePreview || false,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      content: contentObj,
      resources: data.resources || []
    });

    // Update Module & Course denormalized totals
    await Module.findByIdAndUpdate(moduleId, { $inc: { totalLessons: 1 } });
    await Course.findByIdAndUpdate(courseId, { $inc: { totalLessons: 1 } });

    // Send in-app & real-time notifications to all enrolled students
    try {
      const notificationService = require('./notificationService');
      const CourseModel = require('../models/Course');
      const courseDoc = await CourseModel.findById(courseId);
      const enrollments = await Enrollment.find({ course: courseId, status: { $in: ['active', 'completed'] } });

      for (const e of enrollments) {
        await notificationService.notify({
          user: e.student,
          type: 'course_update',
          title: `New Content Added: ${courseDoc?.title || 'Course Update'}`,
          message: `Your instructor added a new lesson: "${lesson.title}". Check it out now!`,
          link: `/learn/${courseId}`,
          priority: 'medium'
        });
      }
    } catch (notifErr) {
      console.warn('⚠️ Could not send student notification for new lesson:', notifErr.message);
    }

    return lesson;
  }

  /**
   * Update Lesson
   */
  async updateLesson(lessonId, data) {
    if (data.videoUrl || (data.content && typeof data.content === 'string')) {
      data.content = {
        text: typeof data.content === 'string' ? data.content : '',
        videoUrl: data.videoUrl || ''
      };
    }
    const lesson = await Lesson.findByIdAndUpdate(lessonId, { $set: data }, { new: true, runValidators: true });
    if (!lesson) {
      throw new AppError('Lesson not found.', 404);
    }
    return lesson;
  }

  /**
   * Delete Lesson
   */
  async deleteLesson(lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new AppError('Lesson not found.', 404);
    }

    await Lesson.findByIdAndDelete(lessonId);

    // Update Module & Course denormalized totals
    await Module.findByIdAndUpdate(lesson.module, { $inc: { totalLessons: -1 } });
    await Course.findByIdAndUpdate(lesson.course, { $inc: { totalLessons: -1 } });

    return { message: 'Lesson deleted successfully.' };
  }

  /**
   * Reorder Lessons in Module
   */
  async reorderLessons(moduleId, lessonOrders) {
    const bulkOps = lessonOrders.map((item) => ({
      updateOne: {
        filter: { _id: item.id, module: moduleId },
        update: { $set: { order: item.order } }
      }
    }));

    await Lesson.bulkWrite(bulkOps);
    const updatedLessons = await Lesson.find({ module: moduleId }).sort({ order: 1 });
    return updatedLessons;
  }

  /**
   * Mark Lesson Complete (Student Progress Engine)
   */
  async markLessonComplete(studentId, lessonId) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      throw new AppError('Lesson not found.', 404);
    }

    // Get or create Progress document
    let progress = await Progress.findOne({ student: studentId, course: lesson.course });
    if (!progress) {
      let enrollment = await Enrollment.findOne({ student: studentId, course: lesson.course });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          student: studentId,
          course: lesson.course,
          status: 'active',
          enrolledAt: new Date()
        });
      }
      progress = await Progress.create({
        student: studentId,
        course: lesson.course,
        enrollment: enrollment._id
      });
    }

    // Add lesson to completedLessons if not already added
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update lessonProgress array
    const existingProgressIndex = progress.lessonProgress.findIndex((lp) => lp.lesson.toString() === lessonId.toString());
    if (existingProgressIndex >= 0) {
      progress.lessonProgress[existingProgressIndex].status = 'completed';
      progress.lessonProgress[existingProgressIndex].completedAt = new Date();
    } else {
      progress.lessonProgress.push({
        lesson: lessonId,
        status: 'completed',
        completedAt: new Date()
      });
    }

    // Increment total study time spent (lesson duration in seconds)
    const lessonDurationSeconds = (lesson.duration || 5) * 60;
    progress.totalTimeSpent = (progress.totalTimeSpent || 0) + lessonDurationSeconds;

    // Calculate overall progress percentage
    const totalCourseLessons = await Lesson.countDocuments({ course: lesson.course, isPublished: true });
    progress.overallProgress = Math.min(100, Math.round((progress.completedLessons.length / (totalCourseLessons || 1)) * 100));
    progress.lastCompletedLesson = lessonId;
    progress.lastAccessedAt = new Date();

    // If all lessons completed (or progress reaches 100%), mark enrollment as completed
    let isCourseJustCompleted = false;
    if (progress.overallProgress >= 100) {
      const updatedEnrollment = await Enrollment.findOneAndUpdate(
        { student: studentId, course: lesson.course },
        { status: 'completed', completedAt: new Date() },
        { new: true }
      );
      if (updatedEnrollment) {
        isCourseJustCompleted = true;
      }
    }

    // Recalculate Mastery Score
    progress.masteryScore = Math.round(
      progress.overallProgress * 0.4 + progress.quizAverage * 0.3 + progress.assignmentAverage * 0.3
    );

    await progress.save();

    // Update student daily streak
    try {
      const User = require('../models/User');
      const studentUser = await User.findById(studentId);
      if (studentUser) await studentUser.recordDailyActivity();
    } catch (streakErr) {
      console.warn('⚠️ Could not update streak on lesson complete:', streakErr.message);
    }

    // Log Activity for Heatmap & XP
    await LearningActivity.create({
      student: studentId,
      course: lesson.course,
      lesson: lessonId,
      type: 'lesson_complete',
      duration: lessonDurationSeconds,
      date: new Date()
    });

    return {
      message: 'Lesson marked as completed!',
      overallProgress: progress.overallProgress,
      masteryScore: progress.masteryScore,
      completedCount: progress.completedLessons.length,
      totalCourseLessons
    };
  }
}

module.exports = new LessonService();
