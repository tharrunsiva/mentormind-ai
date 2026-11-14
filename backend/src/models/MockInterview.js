const mongoose = require('mongoose');

const MockInterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobRole: { type: String, required: true },
  category: {
    type: String,
    enum: ['technical', 'hr', 'behavioral', 'scenario', 'mixed'],
    default: 'technical',
  },
  difficulty: {
    type: String,
    enum: ['Entry', 'Mid-Level', 'Senior'],
    default: 'Entry',
  },
  totalQuestions: { type: Number, default: 4 },
  currentQuestionIndex: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['created', 'in_progress', 'completed'],
    default: 'created',
  },
  overallScore: { type: Number, default: 0 },
  technicalScore: { type: Number, default: 0 },
  relevanceScore: { type: Number, default: 0 },
  completenessScore: { type: Number, default: 0 },
  clarityScore: { type: Number, default: 0 },
  feedbackSummary: { type: String, default: '' },
  strongPoints: [{ type: String }],
  weakPoints: [{ type: String }],
  missedConcepts: [{ type: String }],
  recommendedStudyTopics: [{ type: String }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', MockInterviewSchema);
