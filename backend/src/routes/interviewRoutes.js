const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

router.post('/start', protect, interviewController.startInterview);
router.get('/history/my', protect, interviewController.getMyInterviews);
router.get('/:id', protect, interviewController.getInterview);
router.post('/:id/answer', protect, interviewController.submitAnswer);

module.exports = router;
