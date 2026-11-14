const mongoose = require('mongoose');

const RoadmapTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningRoadmap',
    required: true,
  },
  phaseNumber: { type: Number, required: true },
  topic: { type: String, required: true },
  description: { type: String, default: '' },
  skillName: { type: String, required: true },
  estimatedHours: { type: Number, default: 6 },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'paused'],
    default: 'todo',
  },
  completedAt: { type: Date },
  resources: [{
    title: { type: String },
    url: { type: String },
    resourceType: { type: String, default: 'Documentation' },
    platform: { type: String },
    duration: { type: String },
  }],
}, { timestamps: true });

module.exports = mongoose.model('RoadmapTask', RoadmapTaskSchema);
