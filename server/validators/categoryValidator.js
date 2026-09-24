const { body } = require('express-validator');

const createCategoryValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional({ nullable: true })
    .isMongoId().withMessage('Parent category must be a valid MongoDB ObjectId'),
  body('icon')
    .optional()
    .trim(),
  body('color')
    .optional()
    .trim(),
  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number')
];

const updateCategoryValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional({ nullable: true })
    .isMongoId().withMessage('Parent category must be a valid MongoDB ObjectId'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean')
];

module.exports = {
  createCategoryValidator,
  updateCategoryValidator
};
