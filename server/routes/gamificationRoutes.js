const express = require('express');
const router = express.Router();

const gamificationController = require('../controllers/gamificationController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/leaderboard', optionalAuth, gamificationController.getLeaderboard);

router.use(protect);

router.get('/stats', gamificationController.getStats);
router.get('/achievements', gamificationController.getAchievements);
router.get('/xp-history', gamificationController.getXPHistory);
router.get('/daily-challenge', gamificationController.getDailyChallenge);
router.post('/daily-challenge/complete', gamificationController.completeDailyChallenge);

module.exports = router;
