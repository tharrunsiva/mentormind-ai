const express = require('express');
const router = express.Router();
const skillGapController = require('../controllers/skillGapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, skillGapController.getSkillGapReport);
router.get('/target', protect, skillGapController.getSkillGapReport);

module.exports = router;
