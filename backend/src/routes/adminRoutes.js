const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), adminController.getPlatformStats);
router.get('/learners', protect, authorize('admin'), adminController.getLearners);
router.get('/users', protect, authorize('admin'), adminController.getLearners);
router.get('/system-health', protect, authorize('admin'), adminController.getSystemHealth);
router.get('/logs', protect, authorize('admin'), adminController.getAgentLogs);

module.exports = router;
