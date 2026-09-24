const asyncHandler = require('../middleware/asyncHandler');
const assignmentService = require('../services/assignmentService');
const { successResponse } = require('../utils/apiResponse');

exports.getCourseAssignments = asyncHandler(async (req, res) => {
  const assignments = await assignmentService.getCourseAssignments(req.params.courseId, req.user);
  return successResponse(res, 'Course assignments fetched', { assignments });
});

exports.getAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id, req.user);
  return successResponse(res, 'Assignment details fetched', { assignment });
});

exports.createAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.createAssignment(req.user._id, req.body);
  return successResponse(res, 'Assignment created successfully', { assignment }, 201);
});

exports.updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(req.params.id, req.user._id, req.user.role, req.body);
  return successResponse(res, 'Assignment updated successfully', { assignment });
});

exports.deleteAssignment = asyncHandler(async (req, res) => {
  const result = await assignmentService.deleteAssignment(req.params.id, req.user._id, req.user.role);
  return successResponse(res, result.message);
});
