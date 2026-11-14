const { Skill, LearnerProfile } = require('../models');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
exports.getAllSkills = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skills = await Skill.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: skills.length, skills });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update a skill in learner profile
// @route   POST /api/skills/my-skills
// @access  Private
exports.updateUserSkill = async (req, res, next) => {
  try {
    const { skillName, proficiencyLevel, score } = req.body;
    if (!skillName) {
      return res.status(400).json({ success: false, message: 'Please specify skillName.' });
    }

    let profile = await LearnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new LearnerProfile({ user: req.user.id });
    }

    const levelMap = {
      Beginner: 20,
      Basic: 40,
      Intermediate: 60,
      Advanced: 80,
      Expert: 100,
    };

    const finalScore = score !== undefined ? score : (levelMap[proficiencyLevel] || 40);
    const existingIndex = profile.existingTechnicalSkills.findIndex(
      s => s.name.toLowerCase() === skillName.toLowerCase()
    );

    const skillDoc = await Skill.findOne({ name: new RegExp(`^${skillName}$`, 'i') });

    if (existingIndex >= 0) {
      profile.existingTechnicalSkills[existingIndex].proficiencyLevel = proficiencyLevel || profile.existingTechnicalSkills[existingIndex].proficiencyLevel;
      profile.existingTechnicalSkills[existingIndex].score = finalScore;
      if (skillDoc) profile.existingTechnicalSkills[existingIndex].skill = skillDoc._id;
    } else {
      profile.existingTechnicalSkills.push({
        skill: skillDoc ? skillDoc._id : null,
        name: skillName,
        proficiencyLevel: proficiencyLevel || 'Basic',
        score: finalScore,
        verified: false,
      });
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: `Skill ${skillName} updated.`,
      skills: profile.existingTechnicalSkills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a brand new skill to the platform dictionary
// @route   POST /api/skills
// @access  Private
exports.createSkill = async (req, res, next) => {
  try {
    const { name, category, description, tags, icon } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Please provide name and category.' });
    }

    const existing = await Skill.findOne({ name });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Skill already exists.' });
    }

    const skill = await Skill.create({
      name,
      category,
      description: description || '',
      tags: tags || [],
      icon: icon || 'bi-code-slash',
      proficiencyLevels: [
        { level: 'Beginner', numericalValue: 20, criteria: 'Knows basic terms' },
        { level: 'Basic', numericalValue: 40, criteria: 'Simple tasks' },
        { level: 'Intermediate', numericalValue: 60, criteria: 'Independent implementation' },
        { level: 'Advanced', numericalValue: 80, criteria: 'Optimization & architecture' },
        { level: 'Expert', numericalValue: 100, criteria: 'Subject matter expert' },
      ],
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};
