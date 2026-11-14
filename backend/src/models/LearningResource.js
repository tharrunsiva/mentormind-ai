const mongoose = require('mongoose');

const LearningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  platform: {
    type: String,
    enum: ['YouTube', 'Official Docs', 'Coursera', 'freeCodeCamp', 'Interactive', 'GitHub', 'Medium', 'MDN', 'Article'],
    required: true,
  },
  skillName: { type: String, required: true },
  careerPathSlug: { type: String, default: '' },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  estimatedDuration: { type: String, default: '45 mins' },
  description: { type: String, required: true },
  url: { type: String, required: true },
  isCurated: { type: Boolean, default: true },
  rating: { type: Number, default: 4.8 },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('LearningResource', LearningResourceSchema);
