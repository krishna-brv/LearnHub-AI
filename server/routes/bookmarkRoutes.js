const express = require('express');
const router = express.Router();

const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', bookmarkController.getBookmarks);
router.post('/', bookmarkController.createBookmark);
router.post('/toggle', bookmarkController.toggleBookmark);
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;
