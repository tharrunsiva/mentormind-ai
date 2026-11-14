const mongoose = require('mongoose');

const AssessmentResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillAssessment',
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
  },
  skillName: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, default: 100 },
  percentage: { type: Number, required: true },
  proficiencyAssigned: {
    type: String,
    enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
    required: true,
  },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  feedback: { type: String, default: '' },
  answers: [{
    questionId: String,
    questionText: String,
    selectedAnswer: String,
    isCorrect: Boolean,
    pointsAwarded: Number,
    feedback: String,
  }],
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AssessmentResult', AssessmentResultSchema);
