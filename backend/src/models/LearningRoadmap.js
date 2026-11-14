const mongoose = require('mongoose');

const LearningRoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careerPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
  },
  careerTitle: { type: String, required: true },
  title: { type: String, required: true },
  phases: [{
    phaseNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
    estimatedDurationWeeks: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    milestones: [String],
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoadmapTask',
    }],
  }],
  overallProgress: { type: Number, default: 0 }, // 0 to 100%
  isAdaptiveAdjusted: { type: Boolean, default: false },
  lastAdaptedReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('LearningRoadmap', LearningRoadmapSchema);
