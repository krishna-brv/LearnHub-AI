const asyncHandler = require('../middleware/asyncHandler');
const moduleService = require('../services/moduleService');
const { successResponse } = require('../utils/apiResponse');

exports.getModules = asyncHandler(async (req, res) => {
  const modules = await moduleService.getCourseModules(req.params.courseId);
  return successResponse(res, 'Course modules fetched', { modules });
});

exports.createModule = asyncHandler(async (req, res) => {
  const moduleDoc = await moduleService.createModule(req.params.courseId, req.body);
  return successResponse(res, 'Module created successfully', { module: moduleDoc }, 201);
});

exports.updateModule = asyncHandler(async (req, res) => {
  const moduleDoc = await moduleService.updateModule(req.params.id, req.body);
  return successResponse(res, 'Module updated successfully', { module: moduleDoc });
});

exports.deleteModule = asyncHandler(async (req, res) => {
  const result = await moduleService.deleteModule(req.params.id);
  return successResponse(res, result.message);
});

exports.reorderModules = asyncHandler(async (req, res) => {
  const modules = await moduleService.reorderModules(req.params.courseId, req.body.moduleOrders);
  return successResponse(res, 'Modules reordered successfully', { modules });
});
