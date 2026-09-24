const asyncHandler = require('../middleware/asyncHandler');
const userService = require('../services/userService');
const { successResponse } = require('../utils/apiResponse');

/**
 * Get Own Profile
 * GET /api/users/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  return successResponse(res, 'User profile fetched successfully', { user: profile });
});

/**
 * Update Own Profile
 * PUT /api/users/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user._id, req.body);
  return successResponse(res, 'Profile updated successfully', { user: updatedUser });
});

/**
 * Update Profile Photo (Avatar Upload)
 * PUT /api/users/profile/photo
 */
exports.updateAvatar = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateAvatar(req.user._id, req.file);
  return successResponse(res, 'Profile picture updated successfully', { user: updatedUser });
});

/**
 * Update Student Learning Preferences
 * PUT /api/users/learning-preferences
 */
exports.updateLearningPreferences = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateLearningPreferences(req.user._id, req.body);
  return successResponse(res, 'Learning preferences updated successfully', { user: updatedUser });
});

/**
 * Get All Users (Admin)
 * GET /api/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);
  return successResponse(res, 'Users fetched successfully', { users: result.users }, 200, result.pagination);
});

/**
 * Get User By ID (Admin)
 * GET /api/users/:id
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.params.id);
  return successResponse(res, 'User details fetched', { user });
});

/**
 * Update User Role (Admin)
 * PUT /api/users/:id/role
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const updatedUser = await userService.updateUserRole(req.params.id, role);
  return successResponse(res, `User role updated to ${role}`, { user: updatedUser });
});

/**
 * Update User Status (Admin)
 * PUT /api/users/:id/status
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const updatedUser = await userService.updateUserStatus(req.params.id, isActive);
  return successResponse(res, `User status updated to ${isActive ? 'active' : 'deactivated'}`, { user: updatedUser });
});

/**
 * Delete User (Admin)
 * DELETE /api/users/:id
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const result = await userService.deleteUser(req.params.id);
  return successResponse(res, result.message);
});
