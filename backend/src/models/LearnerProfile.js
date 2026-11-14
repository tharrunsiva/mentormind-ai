const mongoose = require('mongoose');

const LearnerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  fullName: { type: String, required: true },
  avatar: { type: String, default: '' },
  education: { type: String, default: '' },
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  currentYear: { type: String, default: '' },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  existingTechnicalSkills: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    name: { type: String, required: true },
    proficiencyLevel: {
      type: String,
      enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner',
    },
    score: { type: Number, default: 20 }, // 0 to 100
    verified: { type: Boolean, default: false },
    lastAssessed: { type: Date },
  }],
  existingSoftSkills: [{ type: String }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: String,
    url: String,
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String,
  }],
  interests: [{ type: String }],
  preferredLearningStyle: {
    type: String,
    enum: ['Visual', 'Hands-on', 'Reading/Writing', 'Auditory'],
    default: 'Hands-on',
  },
  weeklyHoursAvailable: { type: Number, default: 10 },
  targetCareer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
  },
  targetCareerName: { type: String, default: 'Full Stack Developer' },
  shortTermGoals: [{ type: String }],
  longTermGoals: [{ type: String }],
  resumeData: {
    parsedText: String,
    rawSkills: [String],
    rawEducation: String,
    rawExperience: String,
    uploadedAt: Date,
  },
  careerReadinessScore: { type: Number, default: 35 }, // 0 - 100%
  streakDays: { type: Number, default: 1 },
  lastActiveDate: { type: Date, default: Date.now },
  totalHoursStudied: { type: Number, default: 0 },
  isPublicProfile: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('LearnerProfile', LearnerProfileSchema);
