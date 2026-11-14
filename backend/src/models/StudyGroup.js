const mongoose = require('mongoose');

const StudyGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  targetCareer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
  },
  targetCareerName: { type: String, default: 'Full Stack Development' },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxMembers: { type: Number, default: 6 },
  sharedGoals: [{ type: String }],
  activeChallenge: {
    title: String,
    description: String,
    deadline: Date,
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  icon: { type: String, default: 'bi-people-fill' },
}, { timestamps: true });

module.exports = mongoose.model('StudyGroup', StudyGroupSchema);
