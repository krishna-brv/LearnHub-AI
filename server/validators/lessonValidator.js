const { body } = require('express-validator');

const createLessonValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Lesson title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Lesson title must be between 3 and 200 characters'),
  body('type')
    .notEmpty().withMessage('Lesson type is required')
    .isIn([
      'video',
      'text',
      'markdown',
      'pdf',
      'external_resource',
      'youtube',
      'coding',
      'interactive',
      'practice',
      'quiz'
    ]).withMessage('Invalid lesson type'),
  body('duration')
    .optional()
    .isNumeric().withMessage('Duration must be a number in minutes'),
  body('isPreview')
    .optional()
    .isBoolean().withMessage('isPreview must be a boolean')
];

const reorderLessonsValidator = [
  body('lessonOrders')
    .isArray({ min: 1 }).withMessage('lessonOrders must be a non-empty array')
    .custom((items) => {
      return items.every((item) => item.id && typeof item.order === 'number');
    }).withMessage('Each item must contain id and order number')
];

module.exports = {
  createLessonValidator,
  reorderLessonsValidator
};
