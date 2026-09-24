const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const LearningActivity = require('../models/LearningActivity');
const User = require('../models/User');
const Lesson = require('../models/Lesson');
const QuizAttempt = require('../models/QuizAttempt');
const Submission = require('../models/Submission');
const AppError = require('../utils/AppError');

class ProgressService {
  /**
   * Get Student Progress for Specific Course
   */
  async getCourseProgress(studentId, courseId) {
    let progress = await Progress.findOne({ student: studentId, course: courseId }).populate(
      'completedLessons',
      'title type duration order module'
    );

    if (!progress) {
      let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          student: studentId,
          course: courseId,
          status: 'active',
          enrolledAt: new Date()
        });
      }
      progress = await Progress.create({
        student: studentId,
        course: courseId,
        enrollment: enrollment._id
      });
    }

    // Dynamically calculate fresh overall progress based on live total published lessons in course
    const totalPublishedLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
    const completedCount = progress.completedLessons ? progress.completedLessons.length : 0;
    const freshOverallProgress = totalPublishedLessons > 0 ? Math.min(100, Math.round((completedCount / totalPublishedLessons) * 100)) : 0;

    progress.overallProgress = freshOverallProgress;

    // Sync enrollment status based on fresh overall progress
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (enrollment) {
      if (freshOverallProgress >= 100 && enrollment.status !== 'completed') {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        await enrollment.save();
      } else if (freshOverallProgress < 100 && enrollment.status === 'completed') {
        enrollment.status = 'active';
        await enrollment.save();
      }
    }

    // Recalculate Quiz and Assignment Averages dynamically
    const [quizAttempts, submissions] = await Promise.all([
      QuizAttempt.find({ student: studentId, course: courseId, status: 'submitted' }),
      Submission.find({ student: studentId, course: courseId, status: 'graded' })
    ]);

    let quizAverage = 0;
    if (quizAttempts.length > 0) {
      const sumQuiz = quizAttempts.reduce((acc, q) => acc + q.percentage, 0);
      quizAverage = Math.round(sumQuiz / quizAttempts.length);
    }

    let assignmentAverage = 0;
    if (submissions.length > 0) {
      const sumAssign = submissions.reduce((acc, s) => acc + (s.percentage || 0), 0);
      assignmentAverage = Math.round(sumAssign / submissions.length);
    }

    // Recalculate Mastery Score: 40% lesson completion + 30% quiz avg + 30% assignment avg
    const masteryScore = Math.round(progress.overallProgress * 0.4 + quizAverage * 0.3 + assignmentAverage * 0.3);

    progress.quizAverage = quizAverage;
    progress.assignmentAverage = assignmentAverage;
    progress.totalQuizzesTaken = quizAttempts.length;
    progress.totalAssignmentsSubmitted = submissions.length;
    progress.masteryScore = masteryScore;
    await progress.save();

    return progress;
  }

  /**
   * Get Student Dashboard Learning Overview
   */
  async getStudentOverview(studentId) {
    const user = await User.findById(studentId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const [enrollments, progressList, recentActivities] = await Promise.all([
      Enrollment.find({ student: studentId, status: 'active' }),
      Progress.find({ student: studentId }),
      LearningActivity.find({ student: studentId }).sort({ date: -1 }).limit(10)
    ]);

    const activeCoursesCount = enrollments.length;
    const completedCoursesCount = await Enrollment.countDocuments({ student: studentId, status: 'completed' });

    let totalStudyTimeSeconds = 0;
    let sumOverallProgress = 0;
    let sumMastery = 0;

    progressList.forEach((p) => {
      totalStudyTimeSeconds += p.totalTimeSpent || 0;
      sumOverallProgress += p.overallProgress || 0;
      sumMastery += p.masteryScore || 0;
    });

    const averageProgress = progressList.length > 0 ? Math.round(sumOverallProgress / progressList.length) : 0;
    const averageMastery = progressList.length > 0 ? Math.round(sumMastery / progressList.length) : 0;

    return {
      activeCoursesCount,
      completedCoursesCount,
      totalStudyMinutes: Math.round(totalStudyTimeSeconds / 60),
      averageProgress,
      averageMastery,
      xp: user.xp || 0,
      level: user.level || 1,
      streak: user.streak || { current: 0, longest: 0 },
      recentActivities
    };
  }

  /**
   * Get GitHub-Style Learning Heatmap Data
   */
  async getLearningHeatmap(studentId, year = new Date().getFullYear()) {
    const startDate = new Date(year, 0, 1); // Jan 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59); // Dec 31st

    const activities = await LearningActivity.aggregate([
      {
        $match: {
          student: studentId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
          totalMinutes: { $sum: { $divide: ['$duration', 60] } }
        }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          totalMinutes: { $round: ['$totalMinutes', 0] },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    return activities;
  }

  /**
   * Calculate Learning Activity Streak
   */
  async getStudentStreak(studentId) {
    const user = await User.findById(studentId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user.streak || { current: 0, longest: 0, lastActivityDate: null };
  }

  /**
   * Get Study Time Statistics (Weekly/Monthly)
   */
  async getStudyTimeStats(studentId) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [weeklyAggregate, monthlyAggregate, totalAggregate] = await Promise.all([
      LearningActivity.aggregate([
        { $match: { student: studentId, date: { $gte: sevenDaysAgo } } },
        { $group: { _id: null, totalSeconds: { $sum: '$duration' } } }
      ]),
      LearningActivity.aggregate([
        { $match: { student: studentId, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: null, totalSeconds: { $sum: '$duration' } } }
      ]),
      LearningActivity.aggregate([
        { $match: { student: studentId } },
        { $group: { _id: null, totalSeconds: { $sum: '$duration' } } }
      ])
    ]);

    const weeklyMinutes = Math.round((weeklyAggregate[0]?.totalSeconds || 0) / 60);
    const monthlyMinutes = Math.round((monthlyAggregate[0]?.totalSeconds || 0) / 60);
    const totalMinutes = Math.round((totalAggregate[0]?.totalSeconds || 0) / 60);

    return {
      weeklyMinutes,
      monthlyMinutes,
      totalMinutes,
      weeklyHours: (weeklyMinutes / 60).toFixed(1),
      monthlyHours: (monthlyMinutes / 60).toFixed(1),
      totalHours: (totalMinutes / 60).toFixed(1)
    };
  }
}

module.exports = new ProgressService();
