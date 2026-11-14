const mongoose = require('mongoose');

const AIConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, default: 'New Conversation' },
  lastMessageAt: { type: Date, default: Date.now },
  context: {
    targetCareer: String,
    weakTopics: [String],
    currentRoadmapPhase: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('AIConversation', AIConversationSchema);
