const mongoose = require('mongoose');

const ProgressRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, default: Date.now },
  studyHours: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  assessmentsTaken: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  streakCount: { type: Number, default: 1 },
  readinessScore: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ProgressRecord', ProgressRecordSchema);
