const asyncHandler = require('../middleware/asyncHandler');
const certificateService = require('../services/certificateService');
const { successResponse } = require('../utils/apiResponse');

exports.generateCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.generateCertificate(req.user._id, req.params.courseId);
  return successResponse(res, 'Certificate generated successfully!', { certificate }, 201);
});

exports.verifyCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.verifyCertificate(req.params.certificateId);
  return successResponse(res, 'Certificate verified successfully!', { certificate });
});

exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getStudentCertificates(req.user._id);
  return successResponse(res, 'My certificates fetched', { certificates });
});
