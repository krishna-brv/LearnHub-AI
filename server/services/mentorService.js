const MentorAssignment = require('../models/MentorAssignment');
const MentoringSession = require('../models/MentoringSession');
const MentoringGoal = require('../models/MentoringGoal');
const Feedback = require('../models/Feedback');
const Progress = require('../models/Progress');
const AppError = require('../utils/AppError');

class MentorService {
  /**
  /**
   * Assign Mentor to Student or Course (Admin)
   */
  async assignMentor(mentorId, studentId, courseId, adminId) {
    if (studentId) {
      const existing = await MentorAssignment.findOne({ mentor: mentorId, student: studentId, status: 'active' });
      if (existing) {
        throw new AppError('Mentor is already assigned to this student.', 400);
      }
    } else if (courseId) {
      const existing = await MentorAssignment.findOne({ course: courseId, status: 'active', $or: [{ student: null }, { student: { $exists: false } }] });
      if (existing) {
        if (!mentorId) {
          existing.status = 'cancelled';
          await existing.save();
          return existing;
        }
        existing.mentor = mentorId;
        existing.assignedBy = adminId;
        await existing.save();
        return existing;
      }
    } else {
      throw new AppError('Please select a student or a course to assign the mentor.', 400);
    }

    if (!mentorId) {
      throw new AppError('Please select a mentor.', 400);
    }

    const assignment = await MentorAssignment.create({
      mentor: mentorId,
      student: studentId || null,
      course: courseId || null,
      assignedBy: adminId,
      status: 'active'
    });

    return assignment;
  }

  /**
   * Get Course Level Mentor Assignments
   */
  async getCourseAssignments() {
    const assignments = await MentorAssignment.find({ course: { $ne: null }, status: 'active', $or: [{ student: null }, { student: { $exists: false } }] })
      .populate('mentor', 'firstName lastName email profile.avatar role')
      .populate('course', 'title thumbnail');
    return assignments;
  }

  /**
   * Get Designated Course Mentor & Initialize/Retrieve 1-on-1 Conversation
   */
  async getCourseMentorAndConversation(courseId, studentId) {
    const Course = require('../models/Course');
    const messageService = require('./messageService');

    let mentorUser = null;

    // 1. Check for active course-level mentor assignment
    const assignment = await MentorAssignment.findOne({ course: courseId, status: 'active', $or: [{ student: null }, { student: { $exists: false } }] })
      .populate('mentor', 'firstName lastName email username profile.avatar profile.headline role');

    if (assignment && assignment.mentor) {
      mentorUser = assignment.mentor;
    } else {
      // 2. Fallback to course instructor
      const course = await Course.findById(courseId).populate('instructor', 'firstName lastName email username profile.avatar profile.headline role');
      if (course && course.instructor) {
        mentorUser = course.instructor;
      }
    }

    if (!mentorUser) {
      throw new AppError('No course mentor found for this course.', 404);
    }

    // 3. Find or create 1-on-1 conversation between student and course mentor
    const conversation = await messageService.findOrCreateConversation(studentId, mentorUser._id);

    return {
      mentor: mentorUser,
      conversationId: conversation._id
    };
  }

  /**
   * Get Assigned Mentees for Mentor (Combines Direct Student & Course-Enrolled Students)
   */
  async getAssignedMentees(mentorId) {
    // 1. Direct student assignments
    const directAssignments = await MentorAssignment.find({ mentor: mentorId, status: 'active', student: { $ne: null } })
      .populate('student', 'firstName lastName email username profile.avatar studentProfile.careerGoal')
      .populate('course', 'title thumbnail');

    // 2. Course-level assignments (all students enrolled in mentor's assigned courses)
    const courseAssignments = await MentorAssignment.find({ mentor: mentorId, status: 'active', course: { $ne: null } });
    const courseIds = courseAssignments.map((a) => a.course).filter(Boolean);

    const Enrollment = require('../models/Enrollment');
    const courseEnrollments = courseIds.length > 0
      ? await Enrollment.find({ course: { $in: courseIds }, status: { $in: ['active', 'completed'] } })
          .populate('student', 'firstName lastName email username profile.avatar studentProfile.careerGoal')
          .populate('course', 'title thumbnail')
      : [];

    // Merge and deduplicate by student ID
    const menteeMap = new Map();

    directAssignments.forEach((a) => {
      if (a.student) {
        menteeMap.set(a.student._id.toString(), {
          _id: a._id,
          student: a.student,
          course: a.course,
          assignmentType: 'direct'
        });
      }
    });

    courseEnrollments.forEach((e) => {
      if (e.student && !menteeMap.has(e.student._id.toString())) {
        menteeMap.set(e.student._id.toString(), {
          _id: e._id,
          student: e.student,
          course: e.course,
          assignmentType: 'course_enrolled'
        });
      }
    });

    return Array.from(menteeMap.values());
  }

  /**
   * Get Mentee Progress Details
   */
  async getMenteeProgress(mentorId, studentId) {
    const isAssigned = await MentorAssignment.exists({ mentor: mentorId, student: studentId, status: 'active' });
    if (!isAssigned) {
      throw new AppError('You are not assigned to mentor this student.', 403);
    }

    const progressList = await Progress.find({ student: studentId }).populate('course', 'title thumbnail');
    return progressList;
  }

  /**
   * Schedule Mentoring Session (Auto-routes to Designated Course Mentor)
   */
  async scheduleSession(data, userId) {
    const { mentorAssignment, title, scheduledAt, duration, type, meetingLink, requestedBy } = data;

    let assignment = null;
    let mentorId = null;

    if (mentorAssignment) {
      assignment = await MentorAssignment.findById(mentorAssignment);
      mentorId = assignment ? assignment.mentor : null;
    }

    if (!mentorId) {
      // 1. Check if student has a direct active mentor assignment
      const directAssignment = await MentorAssignment.findOne({ student: userId, status: 'active' });
      if (directAssignment) {
        assignment = directAssignment;
        mentorId = directAssignment.mentor;
      }
    }

    if (!mentorId) {
      // 2. Check if student is enrolled in a course with an assigned Course Mentor
      const Enrollment = require('../models/Enrollment');
      const studentEnrollments = await Enrollment.find({ student: userId, status: { $in: ['active', 'completed'] } });
      const enrolledCourseIds = studentEnrollments.map((e) => e.course);

      if (enrolledCourseIds.length > 0) {
        const courseMentorAssignment = await MentorAssignment.findOne({ course: { $in: enrolledCourseIds }, status: 'active' });
        if (courseMentorAssignment) {
          assignment = courseMentorAssignment;
          mentorId = courseMentorAssignment.mentor;
        }
      }
    }

    if (!mentorId) {
      // 3. Fallback to any active platform mentor/instructor
      const User = require('../models/User');
      const availableMentor = await User.findOne({ role: { $in: ['mentor', 'instructor'] }, isActive: true });
      if (!availableMentor) {
        throw new AppError('No mentors are available for scheduling. Please try again later.', 400);
      }
      mentorId = availableMentor._id;
    }

    const session = await MentoringSession.create({
      mentorAssignment: assignment ? assignment._id : null,
      mentor: mentorId,
      student: userId,
      title: title || '1-on-1 Mentoring Session',
      scheduledAt,
      duration: duration || 30,
      type: type || 'one_on_one',
      meetingLink: meetingLink || '',
      requestedBy: requestedBy || 'student',
      status: 'scheduled'
    });

    // Notify Student
    try {
      const notificationService = require('./notificationService');
      const meetLinkMsg = meetingLink ? ` Meeting link: ${meetingLink}` : '';
      await notificationService.notify({
        user: userId,
        type: 'mentoring',
        title: 'Mentoring Session Booked',
        message: `Your session "${session.title}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}.${meetLinkMsg}`,
        link: '/mentoring',
        priority: 'high'
      });

      // Notify Mentor as well
      await notificationService.notify({
        user: mentorId,
        type: 'mentoring',
        title: 'New 1-on-1 Session Scheduled',
        message: `Session "${session.title}" scheduled for ${new Date(scheduledAt).toLocaleString()}.${meetLinkMsg}`,
        link: '/mentor/dashboard',
        priority: 'high'
      });
    } catch (notifErr) {
      console.warn('⚠️ Could not send mentoring notification:', notifErr.message);
    }

    return session;
  }

  /**
   * Update Meeting Link for Mentoring Session & Notify Student
   */
  async updateSessionMeetingLink(mentorId, sessionId, meetingLink) {
    const session = await MentoringSession.findById(sessionId);
    if (!session) {
      throw new AppError('Mentoring session not found.', 404);
    }

    if (session.mentor.toString() !== mentorId.toString()) {
      throw new AppError('Only the assigned mentor can update the meeting link for this session.', 403);
    }

    session.meetingLink = meetingLink;
    await session.save();

    // Notify Student about the meeting link
    try {
      const notificationService = require('./notificationService');
      await notificationService.notify({
        user: session.student,
        type: 'mentoring',
        title: 'Meeting Link Added by Mentor',
        message: `Your mentor added/updated the meeting link for session "${session.title}": ${meetingLink}`,
        link: '/mentoring',
        priority: 'high'
      });
    } catch (notifErr) {
      console.warn('⚠️ Could not send meeting link notification:', notifErr.message);
    }

    return session;
  }

  /**
   * Create Mentoring Goal for Student
   */
  async createGoal(mentorId, studentId, data) {
    const assignment = await MentorAssignment.findOne({ mentor: mentorId, student: studentId, status: 'active' });
    if (!assignment) {
      throw new AppError('Active mentor assignment not found.', 403);
    }

    const goal = await MentoringGoal.create({
      mentorAssignment: assignment._id,
      mentor: mentorId,
      student: studentId,
      title: data.title,
      description: data.description || '',
      targetDate: data.targetDate,
      priority: data.priority || 'medium',
      milestones: data.milestones || []
    });

    try {
      const notificationService = require('./notificationService');
      await notificationService.notify({
        user: studentId,
        type: 'mentor_feedback',
        title: 'New Mentoring Goal Assigned',
        message: `Your mentor assigned a new learning goal: "${goal.title}". Track your progress now!`,
        link: '/dashboard',
        priority: 'high'
      });
    } catch (notifErr) {
      console.warn('⚠️ Could not send goal notification:', notifErr.message);
    }

    return goal;
  }

  /**
   * Add Feedback for Student
   */
  async addFeedback(mentorId, studentId, data) {
    const assignment = await MentorAssignment.findOne({ mentor: mentorId, student: studentId, status: 'active' });
    if (!assignment) {
      throw new AppError('Active mentor assignment not found.', 403);
    }

    const feedback = await Feedback.create({
      from: mentorId,
      to: studentId,
      mentorAssignment: assignment._id,
      type: data.type || 'general',
      content: data.content,
      rating: data.rating,
      strengths: data.strengths || [],
      areasForImprovement: data.areasForImprovement || [],
      actionItems: data.actionItems || []
    });

    try {
      const notificationService = require('./notificationService');
      await notificationService.notify({
        user: studentId,
        type: 'mentor_feedback',
        title: 'New Performance Feedback from Mentor',
        message: `Your mentor submitted a performance review (${data.rating || 5}★). Check your workstation!`,
        link: '/dashboard',
        priority: 'high'
      });
    } catch (notifErr) {
      console.warn('⚠️ Could not send feedback notification:', notifErr.message);
    }

    return feedback;
  }

  /**
   * Get Mentee Goals
   */
  async getMenteeGoals(userId) {
    return await MentoringGoal.find({
      $or: [{ mentor: userId }, { student: userId }]
    }).populate('student', 'firstName lastName profile.avatar').sort({ createdAt: -1 });
  }

  /**
   * Update Mentoring Goal Progress
   */
  async updateGoalProgress(mentorId, goalId, data) {
    const goal = await MentoringGoal.findById(goalId);
    if (!goal) {
      throw new AppError('Goal not found.', 404);
    }

    if (data.status) goal.status = data.status;
    if (data.progress !== undefined) goal.progress = data.progress;
    if (data.milestones) goal.milestones = data.milestones;

    // Recalculate progress from milestones if milestones exist
    if (goal.milestones && goal.milestones.length > 0) {
      const completedCount = goal.milestones.filter((m) => m.isCompleted).length;
      goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
      if (goal.progress >= 100) {
        goal.status = 'completed';
        goal.completedAt = new Date();
      }
    }

    await goal.save();
    return goal;
  }

  /**
   * Get Upcoming Sessions for Student or Mentor
   */
  async getUpcomingSessions(userId) {
    return await MentoringSession.find({
      $or: [{ mentor: userId }, { student: userId }]
    }).populate('mentor', 'firstName lastName profile.avatar').populate('student', 'firstName lastName profile.avatar').sort({ scheduledAt: 1 });
  }
}

module.exports = new MentorService();
