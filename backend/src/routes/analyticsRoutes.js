const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, analyticsController.getProgressAnalytics);
router.get('/overview', protect, analyticsController.getProgressAnalytics);

module.exports = router;
