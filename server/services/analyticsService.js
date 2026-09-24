const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Submission = require('../models/Submission');
const LearningActivity = require('../models/LearningActivity');
const AIUsageLog = require('../models/AIUsageLog');
const AppError = require('../utils/AppError');

class AnalyticsService {
  /**
   * Platform Admin Global Dashboard Analytics
   */
  async getAdminAnalytics() {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      userRoleCounts,
      courseStatusCounts,
      recentUsers,
      aiUsage
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments({ status: 'active' }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt'),
      AIUsageLog.aggregate([
        { $group: { _id: '$feature', totalTokens: { $sum: '$totalTokens' }, count: { $sum: 1 } } }
      ])
    ]);

    return {
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments
      },
      userDistribution: userRoleCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      courseDistribution: courseStatusCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      recentUsers,
      aiUsageStats: aiUsage
    };
  }

  /**
   * Instructor Dashboard Analytics
   */
  async getInstructorAnalytics(instructorId) {
    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    const [enrollmentsCount, totalRatings, quizStats, submissionStats] = await Promise.all([
      Enrollment.countDocuments({ course: { $in: courseIds } }),
      Course.aggregate([
        { $match: { _id: { $in: courseIds } } },
        { $group: { _id: null, avgRating: { $avg: '$averageRating' }, totalRatings: { $sum: '$totalRatings' } } }
      ]),
      QuizAttempt.aggregate([
        { $match: { course: { $in: courseIds }, status: 'submitted' } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' }, totalAttempts: { $sum: 1 } } }
      ]),
      Submission.aggregate([
        { $match: { course: { $in: courseIds }, status: 'graded' } },
        { $group: { _id: null, avgGrade: { $avg: '$percentage' }, totalGraded: { $sum: 1 } } }
      ])
    ]);

    return {
      totalCourses: courses.length,
      totalStudents: enrollmentsCount,
      averageRating: parseFloat((totalRatings[0]?.avgRating || 0).toFixed(1)),
      totalRatings: totalRatings[0]?.totalRatings || 0,
      quizPassRate: Math.round(quizStats[0]?.avgScore || 0),
      assignmentAvg: Math.round(submissionStats[0]?.avgGrade || 0),
      courses: courses.map((c) => ({
        id: c._id,
        title: c.title,
        status: c.status,
        enrollments: c.enrollmentCount,
        rating: c.averageRating
      }))
    };
  }
}

module.exports = new AnalyticsService();
