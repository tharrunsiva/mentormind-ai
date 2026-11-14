const { SkillGapReport, LearnerProfile, CareerPath } = require('../models');

// @desc    Get or calculate current skill gap analysis
// @route   GET /api/skill-gap
// @access  Private
exports.getSkillGapReport = async (req, res, next) => {
  try {
    const profile = await LearnerProfile.findOne({ user: req.user.id })
      .populate('targetCareer')
      .populate('existingTechnicalSkills.skill');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please complete onboarding.' });
    }

    // Find the target career
    let targetCareer = profile.targetCareer;
    if (!targetCareer) {
      targetCareer = await CareerPath.findOne({ slug: 'full-stack-developer' });
    }

    if (!targetCareer) {
      return res.status(404).json({ success: false, message: 'No target career available.' });
    }

    // Calculate transparent skill gap
    const strongSkills = [];
    const partialSkills = [];
    const missingSkills = [];
    let totalWeightedScore = 0;
    let totalWeight = 0;

    targetCareer.requiredTechnicalSkills.forEach((reqSkill) => {
      const weight = reqSkill.weight || 2;
      totalWeight += weight;

      const userSkill = profile.existingTechnicalSkills.find(
        (s) => s.name.toLowerCase() === reqSkill.name.toLowerCase()
      );
      const currentScore = userSkill ? userSkill.score || 40 : 0;
      const requiredScore = reqSkill.minProficiencyValue || 75;

      const scoreContribution = Math.min(100, (currentScore / requiredScore) * 100);
      totalWeightedScore += scoreContribution * weight;

      if (currentScore >= requiredScore) {
        strongSkills.push({
          skillName: reqSkill.name,
          currentScore,
          requiredScore,
          status: 'Strong',
        });
      } else if (currentScore > 0) {
        partialSkills.push({
          skillName: reqSkill.name,
          currentScore,
          requiredScore,
          gap: requiredScore - currentScore,
          status: 'Developing',
        });
      } else {
        missingSkills.push({
          skillName: reqSkill.name,
          currentScore: 0,
          requiredScore,
          gap: requiredScore,
          priority: reqSkill.weight === 3 ? 'High' : reqSkill.weight === 2 ? 'Medium' : 'Low',
        });
      }
    });

    const overallReadinessPercentage = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

    // Generate actionable, explainable suggestions
    const recommendedNextActions = [];
    if (missingSkills.length > 0) {
      recommendedNextActions.push(
        `Start foundational study for high-priority missing skill: ${missingSkills[0].skillName}.`
      );
    }
    if (partialSkills.length > 0) {
      recommendedNextActions.push(
        `Close the ${partialSkills[0].gap}% gap on ${partialSkills[0].skillName} by taking its practice assessment.`
      );
    }
    recommendedNextActions.push(
      `Check your AI Learning Roadmap to focus on current phase objectives.`
    );

    // Save/Update in DB
    let report = await SkillGapReport.findOne({ user: req.user.id });
    if (!report) {
      report = new SkillGapReport({ user: req.user.id });
    }

    report.careerPath = targetCareer._id;
    report.careerTitle = targetCareer.title;
    report.overallReadinessPercentage = overallReadinessPercentage;
    report.strongSkills = strongSkills;
    report.partialSkills = partialSkills;
    report.missingSkills = missingSkills;
    report.recommendedNextActions = recommendedNextActions;
    report.calculatedAt = new Date();
    await report.save();

    // Also sync back to profile
    profile.careerReadinessScore = overallReadinessPercentage;
    await profile.save();

    res.status(200).json({
      success: true,
      report,
      career: targetCareer,
    });
  } catch (error) {
    next(error);
  }
};
