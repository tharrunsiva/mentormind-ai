const mongoose = require('mongoose');

const SkillAssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillName: { type: String, required: true },
  targetLevel: {
    type: String,
    enum: ['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate',
  },
  timeLimitMinutes: { type: Number, default: 15 },
  totalPoints: { type: Number, default: 100 },
  questions: [{
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'scenario', 'technical', 'short_answer'],
      default: 'mcq',
    },
    question: { type: String, required: true },
    options: [{ type: String }], // For MCQ/scenario
    correctAnswer: { type: String, required: true },
    explanation: { type: String },
    rubric: { type: String }, // For short answer / technical
    points: { type: Number, default: 20 },
  }],
}, { timestamps: true });

module.exports = mongoose.model('SkillAssessment', SkillAssessmentSchema);
