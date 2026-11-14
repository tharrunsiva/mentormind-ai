const { CareerPath, LearnerProfile, SkillGapReport, LearningRoadmap, RoadmapTask, LearningResource } = require('../models');

// @desc    Get all career paths
// @route   GET /api/careers
// @access  Public
exports.getAllCareers = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'toolsAndTechnologies': { $regex: search, $options: 'i' } },
      ];
    }

    const careers = await CareerPath.find(query).populate('requiredTechnicalSkills.skill');
    res.status(200).json({ success: true, count: careers.length, careers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single career by slug
// @route   GET /api/careers/:slug
// @access  Public
exports.getCareerBySlug = async (req, res, next) => {
  try {
    const career = await CareerPath.findOne({ slug: req.params.slug }).populate('requiredTechnicalSkills.skill');
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found.' });
    }

    // If authenticated, also calculate user readiness for this career
    let userReadiness = null;
    if (req.user) {
      const profile = await LearnerProfile.findOne({ user: req.user.id });
      if (profile && profile.existingTechnicalSkills) {
        let totalScore = 0;
        const skillBreakdown = career.requiredTechnicalSkills.map(reqSkill => {
          const matched = profile.existingTechnicalSkills.find(
            s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
          );
          const currentScore = matched ? matched.score || 40 : 0;
          totalScore += Math.min(100, (currentScore / reqSkill.minProficiencyValue) * 100);
          return {
            name: reqSkill.name,
            requiredLevel: reqSkill.requiredLevel,
            requiredScore: reqSkill.minProficiencyValue,
            currentScore,
            status: currentScore >= reqSkill.minProficiencyValue ? 'Mastered' : currentScore > 0 ? 'Developing' : 'Missing',
          };
        });
        const readinessPercentage = Math.round(totalScore / career.requiredTechnicalSkills.length);
        userReadiness = {
          readinessPercentage,
          skillBreakdown,
        };
      }
    }

    res.status(200).json({ success: true, career, userReadiness });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare two careers side by side with user readiness
// @route   POST /api/careers/compare
// @access  Public / Private
exports.compareCareers = async (req, res, next) => {
  try {
    const { careerSlug1, careerSlug2 } = req.body;
    if (!careerSlug1 || !careerSlug2) {
      return res.status(400).json({ success: false, message: 'Please specify careerSlug1 and careerSlug2.' });
    }

    const career1 = await CareerPath.findOne({ slug: careerSlug1 });
    const career2 = await CareerPath.findOne({ slug: careerSlug2 });

    if (!career1 || !career2) {
      return res.status(404).json({ success: false, message: 'One or both career paths not found.' });
    }

    // User skills comparison
    let profile = null;
    if (req.user) {
      profile = await LearnerProfile.findOne({ user: req.user.id });
    }

    const calcReadiness = (career) => {
      if (!profile || !profile.existingTechnicalSkills) return 0;
      let score = 0;
      career.requiredTechnicalSkills.forEach(reqSkill => {
        const matched = profile.existingTechnicalSkills.find(
          s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
        );
        const curr = matched ? matched.score || 40 : 0;
        score += Math.min(100, (curr / reqSkill.minProficiencyValue) * 100);
      });
      return Math.round(score / career.requiredTechnicalSkills.length);
    };

    const comparison = {
      career1: {
        ...career1.toObject(),
        userReadiness: calcReadiness(career1),
      },
      career2: {
        ...career2.toObject(),
        userReadiness: calcReadiness(career2),
      },
      sharedSkills: career1.requiredTechnicalSkills
        .filter(s1 => career2.requiredTechnicalSkills.some(s2 => s2.name.toLowerCase() === s1.name.toLowerCase()))
        .map(s => s.name),
      uniqueToCareer1: career1.requiredTechnicalSkills
        .filter(s1 => !career2.requiredTechnicalSkills.some(s2 => s2.name.toLowerCase() === s1.name.toLowerCase()))
        .map(s => s.name),
      uniqueToCareer2: career2.requiredTechnicalSkills
        .filter(s2 => !career1.requiredTechnicalSkills.some(s1 => s1.name.toLowerCase() === s2.name.toLowerCase()))
        .map(s => s.name),
    };

    res.status(200).json({ success: true, comparison });
  } catch (error) {
    next(error);
  }
};

// @desc    Set target career and adapt roadmap
// @route   POST /api/careers/set-target
// @access  Private
exports.setTargetCareer = async (req, res, next) => {
  try {
    const { careerSlug } = req.body;
    const career = await CareerPath.findOne({ slug: careerSlug });
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career path not found.' });
    }

    let profile = await LearnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new LearnerProfile({ user: req.user.id });
    }

    const previousCareerName = profile.targetCareerName;
    profile.targetCareer = career._id;
    profile.targetCareerName = career.title;

    // Recalculate skill gaps
    const strongSkills = [];
    const partialSkills = [];
    const missingSkills = [];
    let totalScore = 0;

    career.requiredTechnicalSkills.forEach(reqSkill => {
      const userSkill = profile.existingTechnicalSkills.find(
        s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
      );
      const currentScore = userSkill ? userSkill.score || 40 : 0;
      totalScore += Math.min(100, (currentScore / reqSkill.minProficiencyValue) * 100);

      if (currentScore >= reqSkill.minProficiencyValue) {
        strongSkills.push({
          skillName: reqSkill.name,
          currentScore,
          requiredScore: reqSkill.minProficiencyValue,
          status: 'Strong',
        });
      } else if (currentScore > 0) {
        partialSkills.push({
          skillName: reqSkill.name,
          currentScore,
          requiredScore: reqSkill.minProficiencyValue,
          gap: reqSkill.minProficiencyValue - currentScore,
          status: 'Developing',
        });
      } else {
        missingSkills.push({
          skillName: reqSkill.name,
          currentScore: 0,
          requiredScore: reqSkill.minProficiencyValue,
          gap: reqSkill.minProficiencyValue,
          priority: reqSkill.weight === 3 ? 'High' : reqSkill.weight === 2 ? 'Medium' : 'Low',
        });
      }
    });

    const readinessPercentage = Math.round(totalScore / career.requiredTechnicalSkills.length);
    profile.careerReadinessScore = readinessPercentage;
    await profile.save();

    // Update or create SkillGapReport
    let gapReport = await SkillGapReport.findOne({ user: req.user.id });
    if (!gapReport) {
      gapReport = new SkillGapReport({ user: req.user.id });
    }
    gapReport.careerPath = career._id;
    gapReport.careerTitle = career.title;
    gapReport.overallReadinessPercentage = readinessPercentage;
    gapReport.strongSkills = strongSkills;
    gapReport.partialSkills = partialSkills;
    gapReport.missingSkills = missingSkills;
    gapReport.recommendedNextActions = [
      `Prioritize ${missingSkills.slice(0, 2).map(s => s.skillName).join(' and ')} to build foundation for ${career.title}.`,
      `Continue practicing developing skills: ${partialSkills.map(s => s.skillName).join(', ') || 'None'}.`,
      `Take a skill assessment to verify existing proficiency.`
    ];
    gapReport.calculatedAt = new Date();
    await gapReport.save();

    res.status(200).json({
      success: true,
      message: `Target career updated to ${career.title}. Skill gaps recalculated.`,
      career,
      readinessPercentage,
      gapReport,
    });
  } catch (error) {
    next(error);
  }
};
