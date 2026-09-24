const asyncHandler = require('../middleware/asyncHandler');
const skillService = require('../services/skillService');
const { successResponse } = require('../utils/apiResponse');

exports.getSkillTree = asyncHandler(async (req, res) => {
  const userId = req.user ? req.user._id : null;
  const result = await skillService.getSkillTree(userId);
  return successResponse(res, 'Skill tree fetched', result);
});

exports.updateSkillMastery = asyncHandler(async (req, res) => {
  const { masteryLevel } = req.body;
  const studentSkill = await skillService.updateStudentSkill(req.user._id, req.params.id, masteryLevel);
  return successResponse(res, 'Skill mastery updated', { studentSkill });
});
