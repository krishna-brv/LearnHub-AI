const { body } = require('express-validator');

const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Course title must be between 5 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Course description is required')
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Category must be a valid MongoDB ObjectId'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all_levels']).withMessage('Invalid level specified'),
  body('language')
    .optional()
    .trim(),
  body('learningObjectives')
    .isArray({ min: 1 }).withMessage('At least one learning objective is required')
];

const updateCourseValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('Course title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all_levels']).withMessage('Invalid level specified')
];

module.exports = {
  createCourseValidator,
  updateCourseValidator
};
