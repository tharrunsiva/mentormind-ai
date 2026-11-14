const { LearnerProfile, User, PeerConnection, StudyGroup, GroupMessage } = require('../models');

// @desc    Get recommended peers using AI skill matching algorithm
// @route   GET /api/peers/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const currentProfile = await LearnerProfile.findOne({ user: req.user.id });
    if (!currentProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please complete onboarding.' });
    }

    // Get all other learner profiles
    const otherProfiles = await LearnerProfile.find({
      user: { $ne: req.user.id },
      isPublicProfile: true,
    }).populate('user', 'name email avatar educationLevel institution currentYear');

    // Get existing connection statuses
    const existingConnections = await PeerConnection.find({
      $or: [
        { requester: req.user.id },
        { recipient: req.user.id }
      ]
    });

    const mySkills = currentProfile.existingTechnicalSkills || [];
    const myCareer = (currentProfile.targetCareerName || '').toLowerCase();
    const myAvailability = currentProfile.weeklyHoursAvailable || 10;
    const myInterests = currentProfile.interests || [];

    const recommendations = [];

    for (const peerProfile of otherProfiles) {
      const peerSkills = peerProfile.existingTechnicalSkills || [];
      const peerCareer = (peerProfile.targetCareerName || '').toLowerCase();
      const peerAvailability = peerProfile.weeklyHoursAvailable || 10;
      const peerInterests = peerProfile.interests || [];

      // 1. Career Goal Similarity (30%)
      const careerScore = myCareer === peerCareer ? 30 : (myCareer.includes(peerCareer) || peerCareer.includes(myCareer) ? 20 : 10);

      // 2. Complementary Skills (35%)
      // What I know well that peer is weak in / missing
      const iCanTeach = mySkills
        .filter(s => (s.score || 0) >= 60)
        .filter(s => !peerSkills.some(ps => ps.name.toLowerCase() === s.name.toLowerCase() && (ps.score || 0) >= 60))
        .map(s => s.name);

      // What peer knows well that I am weak in / missing
      const peerCanTeach = peerSkills
        .filter(ps => (ps.score || 0) >= 60)
        .filter(ps => !mySkills.some(s => s.name.toLowerCase() === ps.name.toLowerCase() && (s.score || 0) >= 60))
        .map(ps => ps.name);

      const hasComplementary = iCanTeach.length > 0 && peerCanTeach.length > 0;
      const complementaryScore = hasComplementary ? 35 : (iCanTeach.length > 0 || peerCanTeach.length > 0 ? 22 : 12);

      // 3. Learning Interests Overlap (15%)
      const sharedInterests = myInterests.filter(i => peerInterests.includes(i));
      const interestScore = Math.min(15, sharedInterests.length * 5 + 5);

      // 4. Availability Compatibility (10%)
      const hoursDiff = Math.abs(myAvailability - peerAvailability);
      const availabilityScore = hoursDiff <= 3 ? 10 : (hoursDiff <= 6 ? 7 : 4);

      // 5. Preferred Collaboration Style (10%)
      const styleScore = currentProfile.preferredLearningStyle === peerProfile.preferredLearningStyle ? 10 : 6;

      const totalCompatibility = Math.min(99, Math.max(55, careerScore + complementaryScore + interestScore + availabilityScore + styleScore));

      // Check connection status
      const conn = existingConnections.find(c =>
        (c.requester.toString() === req.user.id && c.recipient.toString() === peerProfile.user._id.toString()) ||
        (c.recipient.toString() === req.user.id && c.requester.toString() === peerProfile.user._id.toString())
      );

      let connectionStatus = 'none';
      let connectionId = null;
      if (conn) {
        connectionStatus = conn.status;
        connectionId = conn._id;
      }

      recommendations.push({
        profileId: peerProfile._id,
        userId: peerProfile.user._id,
        name: peerProfile.fullName || peerProfile.user.name,
        institution: peerProfile.institution || peerProfile.user.institution || 'Tech Academy',
        degree: peerProfile.degree || peerProfile.education || 'Computer Science',
        targetCareer: peerProfile.targetCareerName || 'Software Developer',
        compatibilityScore: totalCompatibility,
        skillsTheyCanTeach: peerCanTeach.length > 0 ? peerCanTeach : (peerSkills.slice(0, 2).map(s => s.name)),
        skillsTheyWantToLearn: iCanTeach.length > 0 ? iCanTeach : ['Full-Stack Systems', 'Cloud Deployment'],
        mainSkills: peerSkills.slice(0, 4).map(s => s.name),
        sharedInterests: sharedInterests.length > 0 ? sharedInterests : ['Web Development', 'Open Source'],
        connectionStatus,
        connectionId,
      });
    }

    // Sort by highest compatibility
    recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send connection request to a peer
// @route   POST /api/peers/connect/:userId
// @access  Private
exports.sendConnectionRequest = async (req, res, next) => {
  try {
    const recipientId = req.params.userId;
    if (recipientId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself.' });
    }

    const existing = await PeerConnection.findOne({
      $or: [
        { requester: req.user.id, recipient: recipientId },
        { requester: recipientId, recipient: req.user.id }
      ]
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `A connection already exists with status: ${existing.status}` });
    }

    const connection = await PeerConnection.create({
      requester: req.user.id,
      recipient: recipientId,
      status: 'pending',
      compatibilityScore: req.body.compatibilityScore || 85,
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully.',
      connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to connection request (accept or reject)
// @route   PUT /api/peers/requests/:connectionId
// @access  Private
exports.respondConnectionRequest = async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const connection = await PeerConnection.findOne({
      _id: req.params.connectionId,
      recipient: req.user.id,
    });

    if (!connection) {
      return res.status(404).json({ success: false, message: 'Connection request not found.' });
    }

    connection.status = status;
    if (status === 'accepted') {
      connection.connectedAt = new Date();
    }
    await connection.save();

    res.status(200).json({
      success: true,
      message: `Connection request ${status}.`,
      connection,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get accepted connections
// @route   GET /api/peers/connections
// @access  Private
exports.getMyConnections = async (req, res, next) => {
  try {
    const connections = await PeerConnection.find({
      $or: [
        { requester: req.user.id, status: 'accepted' },
        { recipient: req.user.id, status: 'accepted' }
      ]
    })
      .populate('requester', 'name email avatar institution')
      .populate('recipient', 'name email avatar institution');

    // Return the other party in each connection
    const peers = connections.map(c => {
      const isRequester = c.requester._id.toString() === req.user.id;
      const peerUser = isRequester ? c.recipient : c.requester;
      return {
        connectionId: c._id,
        peer: peerUser,
        connectedAt: c.connectedAt,
        compatibilityScore: c.compatibilityScore,
      };
    });

    res.status(200).json({ success: true, count: peers.length, peers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study groups
// @route   GET /api/peers/study-groups
// @access  Private
exports.getStudyGroups = async (req, res, next) => {
  try {
    const groups = await StudyGroup.find()
      .populate('creator', 'name')
      .populate('members', 'name email');

    res.status(200).json({ success: true, count: groups.length, groups });
  } catch (error) {
    next(error);
  }
};

// @desc    Join study group
// @route   POST /api/peers/study-groups/:id/join
// @access  Private
exports.joinStudyGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found.' });
    }

    if (!group.members.includes(req.user.id)) {
      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ success: false, message: 'This study group has reached maximum member capacity.' });
      }
      group.members.push(req.user.id);
      await group.save();
    }

    res.status(200).json({ success: true, message: 'Successfully joined study group.', group });
  } catch (error) {
    next(error);
  }
};

// @desc    Create study group
// @route   POST /api/peers/study-groups
// @access  Private
exports.createStudyGroup = async (req, res, next) => {
  try {
    const { name, description, targetCareerName, sharedGoals } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required.' });
    }

    const group = await StudyGroup.create({
      name,
      description: description || 'Collaborative skill study group',
      targetCareerName: targetCareerName || 'Full Stack Development',
      creator: req.user.id,
      members: [req.user.id],
      sharedGoals: sharedGoals || ['Weekly coding sprints', 'Mock interview preparation'],
      activeChallenge: {
        title: 'Weekly Sprint Challenge: Build a Reusable Component',
        description: 'Design and document an accessible UI component or backend API service.',
        deadline: new Date(Date.now() + 7 * 86400000),
      }
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};
