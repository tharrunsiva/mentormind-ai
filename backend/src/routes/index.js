const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const skillRoutes = require('./skillRoutes');
const careerRoutes = require('./careerRoutes');
const assessmentRoutes = require('./assessmentRoutes');
const skillGapRoutes = require('./skillGapRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const resourceRoutes = require('./resourceRoutes');
const mentorRoutes = require('./mentorRoutes');
const peerRoutes = require('./peerRoutes');
const interviewRoutes = require('./interviewRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/skills', skillRoutes);
router.use('/careers', careerRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/resources', resourceRoutes);
router.use('/mentor', mentorRoutes);
router.use('/peers', peerRoutes);
router.use('/interviews', interviewRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'MentorMind AI Node.js Backend API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
