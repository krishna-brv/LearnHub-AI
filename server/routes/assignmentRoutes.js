const express = require('express');
const router = express.Router();

const assignmentController = require('../controllers/assignmentController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createAssignmentValidator } = require('../validators/assignmentValidator');

router.get('/course/:courseId', optionalAuth, assignmentController.getCourseAssignments);
router.get('/:id', optionalAuth, assignmentController.getAssignment);

// Protected Instructor / Admin Routes
router.use(protect);
router.use(restrictTo('instructor', 'admin'));

router.post('/', createAssignmentValidator, validate, assignmentController.createAssignment);
router.put('/:id', assignmentController.updateAssignment);
router.delete('/:id', assignmentController.deleteAssignment);

module.exports = router;
