const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.get('/', resourceController.getResources);
router.post('/:id/bookmark', protect, resourceController.toggleBookmark);
router.get('/bookmarks/my', protect, resourceController.getMyBookmarks);

module.exports = router;
