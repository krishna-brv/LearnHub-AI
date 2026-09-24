const User = require('../models/User');
const AppError = require('../utils/AppError');
const cloudinary = require('../config/cloudinary');

class UserService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 404);
    }
    await user.recordDailyActivity();
    return user;
  }

  /**
   * Update current user profile
   */
  async updateProfile(userId, updateData) {
    const allowedFields = [
      'firstName',
      'lastName',
      'profile',
      'studentProfile',
      'instructorProfile',
      'portfolioSettings',
      'notificationPreferences'
    ];

    // Filter out unallowed fields
    const filteredUpdate = {};
    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: filteredUpdate },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError('User not found.', 404);
    }

    return updatedUser;
  }

  /**
   * Upload Profile Photo (Cloudinary)
   */
  async updateAvatar(userId, file) {
    if (!file) {
      throw new AppError('Please provide an image file to upload.', 400);
    }

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'learnhub-ai/avatars',
          transformation: [{ width: 300, height: 300, crop: 'fill', gravity: 'face' }],
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
        },
        async (error, result) => {
          if (error) {
            return reject(new AppError('Image upload failed. Please try again.', 500));
          }

          try {
            const updatedUser = await User.findByIdAndUpdate(
              userId,
              { 'profile.avatar': result.secure_url },
              { new: true }
            );
            resolve(updatedUser);
          } catch (dbErr) {
            reject(dbErr);
          }
        }
      );

      uploadStream.end(file.buffer);
    });
  }

  /**
   * Update Student Learning Preferences
   */
  async updateLearningPreferences(userId, preferences) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { learningPreferences: preferences } },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  /**
   * Get all users (Admin paginated)
   */
  async getAllUsers(queryParams) {
    const { page = 1, limit = 10, role, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (status !== undefined) {
      filter.isActive = status === 'active';
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limitNum),
      User.countDocuments(filter)
    ]);

    return {
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Admin: Update User Role
   */
  async updateUserRole(userId, newRole) {
    const validRoles = ['student', 'instructor', 'reviewer', 'mentor', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new AppError('Invalid role specified.', 400);
    }

    const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true, runValidators: true });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  /**
   * Admin: Update User Status (Activate / Deactivate)
   */
  async updateUserStatus(userId, isActive) {
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return user;
  }

  /**
   * Admin: Delete User
   */
  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return { message: 'User account deleted successfully.' };
  }
}

module.exports = new UserService();
