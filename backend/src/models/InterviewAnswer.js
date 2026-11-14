const mongoose = require('mongoose');

const InterviewAnswerSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterview',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewQuestion',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answerText: { type: String, required: true },
  audioRecorded: { type: Boolean, default: false },
  score: { type: Number, default: 0 },
  criteriaScores: {
    technical: { type: Number, default: 0 },
    relevance: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    clarity: { type: Number, default: 0 },
  },
  feedback: { type: String, default: '' },
  strengths: [{ type: String }],
  suggestions: [{ type: String }],
  followUpQuestion: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('InterviewAnswer', InterviewAnswerSchema);
