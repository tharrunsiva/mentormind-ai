const mongoose = require('mongoose');

const AIMessageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AIConversation',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: { type: String, required: true },
  suggestedActions: [{ type: String }],
  tokensUsed: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('AIMessage', AIMessageSchema);
