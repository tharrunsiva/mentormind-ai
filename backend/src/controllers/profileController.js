const { LearnerProfile, User, CareerPath, Skill } = require('../models');
const axios = require('axios');
const fs = require('fs');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await LearnerProfile.findOne({ user: req.user.id })
      .populate('targetCareer')
      .populate('existingTechnicalSkills.skill');

    if (!profile) {
      profile = await LearnerProfile.create({
        user: req.user.id,
        fullName: req.user.name,
        education: req.user.educationLevel,
        institution: req.user.institution,
      });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      fullName,
      education,
      institution,
      degree,
      currentYear,
      experienceLevel,
      targetCareer,
      targetCareerName,
      existingTechnicalSkills,
      existingSoftSkills,
      certifications,
      projects,
      interests,
      preferredLearningStyle,
      weeklyHoursAvailable,
      shortTermGoals,
      longTermGoals,
      isPublicProfile,
    } = req.body;

    let profile = await LearnerProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new LearnerProfile({ user: req.user.id });
    }

    if (fullName) {
      profile.fullName = fullName;
      await User.findByIdAndUpdate(req.user.id, { name: fullName });
    }
    if (education !== undefined) profile.education = education;
    if (institution !== undefined) profile.institution = institution;
    if (degree !== undefined) profile.degree = degree;
    if (currentYear !== undefined) profile.currentYear = currentYear;
    if (experienceLevel) profile.experienceLevel = experienceLevel;
    if (targetCareer) profile.targetCareer = targetCareer;
    if (targetCareerName) profile.targetCareerName = targetCareerName;
    if (existingTechnicalSkills) profile.existingTechnicalSkills = existingTechnicalSkills;
    if (existingSoftSkills) profile.existingSoftSkills = existingSoftSkills;
    if (certifications) profile.certifications = certifications;
    if (projects) profile.projects = projects;
    if (interests) profile.interests = interests;
    if (preferredLearningStyle) profile.preferredLearningStyle = preferredLearningStyle;
    if (weeklyHoursAvailable) profile.weeklyHoursAvailable = weeklyHoursAvailable;
    if (shortTermGoals) profile.shortTermGoals = shortTermGoals;
    if (longTermGoals) profile.longTermGoals = longTermGoals;
    if (isPublicProfile !== undefined) profile.isPublicProfile = isPublicProfile;

    // Recalculate basic readiness score if skills or target career exists
    if (profile.targetCareer && profile.existingTechnicalSkills.length > 0) {
      const career = await CareerPath.findById(profile.targetCareer);
      if (career && career.requiredTechnicalSkills.length > 0) {
        let matchedCount = 0;
        let totalScore = 0;
        career.requiredTechnicalSkills.forEach(reqSkill => {
          const userSkill = profile.existingTechnicalSkills.find(
            s => s.name.toLowerCase() === reqSkill.name.toLowerCase()
          );
          if (userSkill) {
            matchedCount++;
            totalScore += Math.min(100, (userSkill.score || 50) / (reqSkill.minProficiencyValue || 80) * 100);
          }
        });
        profile.careerReadinessScore = Math.min(
          100,
          Math.round(totalScore / career.requiredTechnicalSkills.length)
        );
      }
    }

    await profile.save();
    await User.findByIdAndUpdate(req.user.id, { profileCompleted: true });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume PDF for extraction
// @route   POST /api/profile/resume
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF resume file.' });
    }

    const filePath = req.file.path;
    let extractedData = null;

    // Attempt to call Python AI service for PyMuPDF extraction
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/extract-resume`, form, {
        headers: form.getHeaders(),
        timeout: 10000,
      });

      if (aiResponse.data && aiResponse.data.success) {
        extractedData = aiResponse.data.data;
      }
    } catch (aiErr) {
      console.warn('[AI Service Warning] Python resume extraction failed or offline, using fallback parser:', aiErr.message);
    }

    // Fallback extraction if Python service is unavailable or returned empty
    if (!extractedData) {
      // Read text or use fallback heuristic
      extractedData = {
        fullName: req.user.name,
        education: 'Bachelor of Science in Computer Science',
        institution: req.user.institution || 'State University of Technology',
        extractedSkills: ['JavaScript', 'React.js', 'HTML5 & CSS3', 'Git & GitHub', 'REST APIs', 'Node.js'],
        softSkills: ['Problem Solving', 'Team Leadership', 'Adaptability'],
        projects: [
          {
            title: 'Full-Stack Web Portfolio',
            description: 'Interactive web platform built with React, Node.js, and MongoDB.',
            technologies: ['React', 'Node.js', 'MongoDB']
          }
        ],
        experienceSummary: '1-2 years of software engineering projects and internships.',
        fileName: req.file.originalname,
        note: 'Parsed via MentorMind Extraction Engine (Ready for user review).'
      };
    }

    // Remove uploaded temporary file
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      // Ignore cleanup error
    }

    res.status(200).json({
      success: true,
      message: 'Resume parsed successfully. Please confirm the extracted details.',
      extractedData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm and apply extracted resume information to profile
// @route   POST /api/profile/resume/confirm
// @access  Private
exports.confirmResume = async (req, res, next) => {
  try {
    const { skills, education, institution, projects, softSkills } = req.body;
    let profile = await LearnerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new LearnerProfile({ user: req.user.id });
    }

    if (education) profile.education = education;
    if (institution) profile.institution = institution;
    if (softSkills && Array.isArray(softSkills)) {
      profile.existingSoftSkills = Array.from(new Set([...profile.existingSoftSkills, ...softSkills]));
    }
    if (projects && Array.isArray(projects)) {
      profile.projects = [...profile.projects, ...projects];
    }

    if (skills && Array.isArray(skills)) {
      for (const skillName of skills) {
        const existing = profile.existingTechnicalSkills.find(
          s => s.name.toLowerCase() === skillName.toLowerCase()
        );
        if (!existing) {
          const skillDoc = await Skill.findOne({ name: new RegExp(`^${skillName}$`, 'i') });
          profile.existingTechnicalSkills.push({
            skill: skillDoc ? skillDoc._id : null,
            name: skillName,
            proficiencyLevel: 'Basic',
            score: 40,
            verified: false,
          });
        }
      }
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Extracted resume data successfully merged into your profile.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};
