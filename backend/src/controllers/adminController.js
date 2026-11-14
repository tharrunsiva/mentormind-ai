const { User, LearnerProfile, CareerPath, Skill, LearningResource, AssessmentResult, MockInterview, AgentExecutionLog } = require('../models');
const axios = require('axios');
const mongoose = require('mongoose');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Get aggregate platform statistics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLearners = await User.countDocuments({ role: 'learner' });
    const totalAssessments = await AssessmentResult.countDocuments();
    const totalInterviews = await MockInterview.countDocuments({ status: 'completed' });
    const totalCareers = await CareerPath.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalResources = await LearningResource.countDocuments();

    // Calculate assessment average score
    const allAssessments = await AssessmentResult.find().select('percentage');
    const avgScore = allAssessments.length > 0
      ? Math.round(allAssessments.reduce((acc, curr) => acc + curr.percentage, 0) / allAssessments.length)
      : 76;

    // Recent user signups
    const recentSignups = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent AI agent execution logs
    const recentAgentLogs = await AgentExecutionLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalLearners,
        totalAssessments,
        totalInterviews,
        totalCareers,
        totalSkills,
        totalResources,
        avgAssessmentScore: avgScore,
      },
      recentSignups,
      recentAgentLogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated learners list
// @route   GET /api/admin/learners
// @access  Private (Admin)
exports.getLearners = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const learners = await User.find({ role: 'learner' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments({ role: 'learner' });

    // Populate profile readiness
    const enriched = await Promise.all(
      learners.map(async (l) => {
        const profile = await LearnerProfile.findOne({ user: l._id });
        return {
          ...l.toObject(),
          profile: profile
            ? {
                targetCareerName: profile.targetCareerName,
                careerReadinessScore: profile.careerReadinessScore,
                streakDays: profile.streakDays,
                skillsCount: profile.existingTechnicalSkills.length,
              }
            : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      learners: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system health and AI service connectivity
// @route   GET /api/admin/system-health
// @access  Private (Admin)
exports.getSystemHealth = async (req, res, next) => {
  try {
    let aiServiceOnline = false;
    let aiProvider = 'demo';
    let aiServiceDetails = null;

    try {
      const aiResp = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
      if (aiResp.status === 200) {
        aiServiceOnline = true;
        aiServiceDetails = aiResp.data;
        aiProvider = aiResp.data.provider || 'gemini';
      }
    } catch (e) {
      aiServiceOnline = false;
    }

    const dbState = mongoose.connection.readyState;
    const dbStatusMap = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    res.status(200).json({
      success: true,
      system: {
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        database: {
          status: dbStatusMap[dbState] || 'Active',
          host: mongoose.connection.host || 'Local MongoDB Server',
        },
        aiService: {
          online: aiServiceOnline,
          url: AI_SERVICE_URL,
          provider: aiProvider,
          details: aiServiceDetails || { mode: 'Autonomous Fallback & Demo Mode Active' },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent AI Agent execution logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getAgentLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await AgentExecutionLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
