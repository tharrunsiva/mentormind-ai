const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, mentorController.getConversations);
router.get('/conversations/:id/messages', protect, mentorController.getMessages);
router.post('/chat', protect, mentorController.sendMessage);

module.exports = router;
