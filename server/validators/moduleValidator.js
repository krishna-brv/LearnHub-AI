const { body } = require('express-validator');

const createModuleValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Module title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Module title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('order')
    .optional()
    .isNumeric().withMessage('Order must be a number')
];

const reorderModulesValidator = [
  body('moduleOrders')
    .isArray({ min: 1 }).withMessage('moduleOrders must be a non-empty array')
    .custom((items) => {
      return items.every((item) => item.id && typeof item.order === 'number');
    }).withMessage('Each item must contain id and order number')
];

module.exports = {
  createModuleValidator,
  reorderModulesValidator
};
