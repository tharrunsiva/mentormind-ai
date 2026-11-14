const express = require('express');
const router = express.Router();
const peerController = require('../controllers/peerController');
const { protect } = require('../middleware/auth');

router.get('/recommendations', protect, peerController.getRecommendations);
router.post('/connect/:userId', protect, peerController.sendConnectionRequest);
router.put('/requests/:connectionId', protect, peerController.respondConnectionRequest);
router.get('/connections', protect, peerController.getMyConnections);

router.get('/study-groups', protect, peerController.getStudyGroups);
router.post('/study-groups', protect, peerController.createStudyGroup);
router.post('/study-groups/:id/join', protect, peerController.joinStudyGroup);

module.exports = router;
