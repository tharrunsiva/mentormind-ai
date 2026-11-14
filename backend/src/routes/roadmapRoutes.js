const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

router.get('/', protect, roadmapController.getRoadmap);
router.get('/active', protect, roadmapController.getRoadmap);
router.post('/generate', protect, roadmapController.generateRoadmap);
router.put('/tasks/:taskId', protect, roadmapController.updateTaskStatus);
router.patch('/tasks/:taskId', protect, roadmapController.updateTaskStatus);
router.patch('/:roadmapId/tasks/:taskId', protect, roadmapController.updateTaskStatus);

module.exports = router;
