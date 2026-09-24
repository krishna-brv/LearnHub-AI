const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', notificationController.getNotifications);
router.post('/send-reminder', notificationController.sendReminder);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);

module.exports = router;
