const asyncHandler = require('../middleware/asyncHandler');
const mentorService = require('../services/mentorService');
const { successResponse } = require('../utils/apiResponse');

exports.assignMentor = asyncHandler(async (req, res) => {
  const { mentorId, studentId, courseId } = req.body;
  const assignment = await mentorService.assignMentor(mentorId, studentId, courseId, req.user._id);
  return successResponse(res, 'Mentor assigned successfully', { assignment }, 201);
});

exports.getCourseAssignments = asyncHandler(async (req, res) => {
  const assignments = await mentorService.getCourseAssignments();
  return successResponse(res, 'Course mentor assignments fetched', { assignments });
});

exports.getAssignedMentees = asyncHandler(async (req, res) => {
  const mentees = await mentorService.getAssignedMentees(req.user._id);
  return successResponse(res, 'Assigned mentees fetched', { mentees });
});

exports.getMenteeProgress = asyncHandler(async (req, res) => {
  const progress = await mentorService.getMenteeProgress(req.user._id, req.params.studentId);
  return successResponse(res, 'Mentee progress fetched', { progress });
});

exports.scheduleSession = asyncHandler(async (req, res) => {
  const session = await mentorService.scheduleSession(req.body, req.user._id);
  return successResponse(res, 'Mentoring session scheduled', { session }, 201);
});

exports.updateSessionMeetingLink = asyncHandler(async (req, res) => {
  const session = await mentorService.updateSessionMeetingLink(req.user._id, req.params.sessionId, req.body.meetingLink);
  return successResponse(res, 'Meeting link updated and student notified', { session });
});

exports.getCourseMentorAndConversation = asyncHandler(async (req, res) => {
  const result = await mentorService.getCourseMentorAndConversation(req.params.courseId, req.user._id);
  return successResponse(res, 'Course mentor and 1-on-1 conversation retrieved', result);
});

exports.createGoal = asyncHandler(async (req, res) => {
  const goal = await mentorService.createGoal(req.user._id, req.params.studentId, req.body);
  return successResponse(res, 'Mentoring goal set', { goal }, 201);
});

exports.addFeedback = asyncHandler(async (req, res) => {
  const feedback = await mentorService.addFeedback(req.user._id, req.params.studentId, req.body);
  return successResponse(res, 'Mentor feedback saved', { feedback }, 201);
});

exports.getGoals = asyncHandler(async (req, res) => {
  const goals = await mentorService.getMenteeGoals(req.user._id);
  return successResponse(res, 'Mentoring goals fetched', { goals });
});

exports.updateGoalProgress = asyncHandler(async (req, res) => {
  const goal = await mentorService.updateGoalProgress(req.user._id, req.params.goalId, req.body);
  return successResponse(res, 'Goal progress updated', { goal });
});

exports.getUpcomingSessions = asyncHandler(async (req, res) => {
  const sessions = await mentorService.getUpcomingSessions(req.user._id);
  return successResponse(res, 'Upcoming mentoring sessions fetched', { sessions });
});
