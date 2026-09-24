const express = require('express');
const router = express.Router();

const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');

// Public Certificate Verification Endpoint
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Protected Student Endpoints
router.use(protect);
router.post('/generate/:courseId', restrictTo('student'), certificateController.generateCertificate);
router.get('/my', restrictTo('student'), certificateController.getMyCertificates);

module.exports = router;
