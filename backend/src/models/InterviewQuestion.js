const mongoose = require('mongoose');

const InterviewQuestionSchema = new mongoose.Schema({
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockInterview',
    required: true,
  },
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true },
  category: { type: String, default: 'technical' },
  difficulty: { type: String, default: 'Entry' },
  idealAnswerSummary: { type: String, default: '' },
  followUpToQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewQuestion' },
}, { timestamps: true });

module.exports = mongoose.model('InterviewQuestion', InterviewQuestionSchema);
