const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to get :courseId

const moduleController = require('../controllers/moduleController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const { checkOwnership } = require('../middleware/ownership');
const validate = require('../middleware/validate');
const Course = require('../models/Course');
const { createModuleValidator, reorderModulesValidator } = require('../validators/moduleValidator');

// Public route to view course modules
router.get('/', moduleController.getModules);

// Protected Instructor Routes
router.use(protect);
router.use(restrictTo('instructor', 'admin'));
router.use(checkOwnership(Course, 'courseId', 'instructor'));

router.post('/', createModuleValidator, validate, moduleController.createModule);
router.put('/reorder', reorderModulesValidator, validate, moduleController.reorderModules);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;
