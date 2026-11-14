const mongoose = require('mongoose');

const CareerPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    default: 'Software Development',
  },
  description: { type: String, required: true },
  badgeColor: { type: String, default: 'primary' },
  icon: { type: String, default: 'bi-laptop' },
  requiredTechnicalSkills: [{
    skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    name: { type: String, required: true },
    requiredLevel: {
      type: String,
      enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    weight: { type: Number, default: 1 }, // 1 to 3
    minProficiencyValue: { type: Number, default: 60 }, // 0 to 100
  }],
  requiredSoftSkills: [{ type: String }],
  responsibilities: [{ type: String }],
  toolsAndTechnologies: [{ type: String }],
  exampleProjects: [{
    title: String,
    description: String,
    techStack: [String],
  }],
  prerequisites: [{ type: String }],
  suggestedCertifications: [{ type: String }],
  averageSalaryRange: { type: String, default: '$75,000 - $130,000' },
  jobGrowthOutlook: { type: String, default: '+22% (Faster than average)' },
}, { timestamps: true });

module.exports = mongoose.model('CareerPath', CareerPathSchema);
