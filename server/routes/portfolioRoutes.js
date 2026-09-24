const express = require('express');
const router = express.Router();

const portfolioController = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.get('/:username', portfolioController.getPublicPortfolio);

router.use(protect);
router.put('/settings', portfolioController.updatePortfolioSettings);

module.exports = router;
