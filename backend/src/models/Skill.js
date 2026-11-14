const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Cloud', 'AI/ML', 'Mobile', 'Security', 'Design', 'Soft Skills', 'General'],
    required: true,
  },
  description: { type: String, default: '' },
  proficiencyLevels: [{
    level: {
      type: String,
      enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
    },
    numericalValue: { type: Number }, // 20, 40, 60, 80, 100
    criteria: String,
  }],
  tags: [String],
  icon: { type: String, default: 'bi-code-slash' },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
