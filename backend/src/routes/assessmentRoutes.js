const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const { protect } = require('../middleware/auth');

router.get('/', assessmentController.getAssessments);
router.get('/skill/:skillName', protect, assessmentController.getAssessmentForSkill);
router.post('/submit', protect, assessmentController.submitAssessment);
router.get('/results/my', protect, assessmentController.getMyResults);

module.exports = router;
