const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', skillController.getAllSkills);
router.post('/my-skills', protect, skillController.updateUserSkill);
router.post('/', protect, authorize('admin'), skillController.createSkill);

module.exports = router;
