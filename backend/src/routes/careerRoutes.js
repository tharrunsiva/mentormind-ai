const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');
const { protect } = require('../middleware/auth');

router.get('/', careerController.getAllCareers);
router.post('/compare', careerController.compareCareers);
router.get('/:slug', careerController.getCareerBySlug);
router.post('/set-target', protect, careerController.setTargetCareer);

module.exports = router;
