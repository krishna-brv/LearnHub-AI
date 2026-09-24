const express = require('express');
const router = express.Router();

const skillController = require('../controllers/skillController');
const { protect, optionalAuth } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');

router.get('/tree', optionalAuth, skillController.getSkillTree);

router.use(protect);
router.put('/:id/mastery', restrictTo('student'), skillController.updateSkillMastery);

module.exports = router;
