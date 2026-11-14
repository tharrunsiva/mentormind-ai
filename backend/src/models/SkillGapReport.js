const mongoose = require('mongoose');

const SkillGapReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careerPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
    required: true,
  },
  careerTitle: { type: String, required: true },
  overallReadinessPercentage: { type: Number, required: true }, // e.g., 42%
  strongSkills: [{
    skillName: String,
    currentScore: Number,
    requiredScore: Number,
    status: { type: String, default: 'Strong' },
  }],
  partialSkills: [{
    skillName: String,
    currentScore: Number,
    requiredScore: Number,
    gap: Number,
    status: { type: String, default: 'Developing' },
  }],
  missingSkills: [{
    skillName: String,
    currentScore: { type: Number, default: 0 },
    requiredScore: Number,
    gap: Number,
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'High' },
  }],
  recommendedNextActions: [{ type: String }],
  calculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('SkillGapReport', SkillGapReportSchema);
