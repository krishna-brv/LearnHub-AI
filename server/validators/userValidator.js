const { body } = require('express-validator');

const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('headline')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Headline cannot exceed 100 characters'),
  body('githubUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid GitHub URL'),
  body('linkedinUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid LinkedIn URL'),
  body('portfolioUrl')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid Portfolio URL')
];

const updateRoleValidator = [
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['student', 'instructor', 'reviewer', 'mentor', 'admin']).withMessage('Invalid role specified')
];

const updateStatusValidator = [
  body('isActive')
    .notEmpty().withMessage('isActive boolean field is required')
    .isBoolean().withMessage('isActive must be a boolean')
];

const updateLearningPreferencesValidator = [
  body('dailyStudyTime')
    .optional()
    .isNumeric().withMessage('Daily study time must be a number in minutes'),
  body('preferredLearningTime')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night']).withMessage('Invalid preferred learning time'),
  body('difficultyPreference')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'mixed']).withMessage('Invalid difficulty preference')
];

module.exports = {
  updateProfileValidator,
  updateRoleValidator,
  updateStatusValidator,
  updateLearningPreferencesValidator
};
