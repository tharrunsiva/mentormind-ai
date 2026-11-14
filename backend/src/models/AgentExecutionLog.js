const mongoose = require('mongoose');

const AgentExecutionLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  agentName: {
    type: String,
    required: true,
  },
  trigger: {
    type: String,
    required: true,
  },
  inputSummary: { type: String, default: '' },
  outputSummary: { type: String, default: '' },
  executionTimeMs: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['success', 'fallback_mode', 'error'],
    default: 'success',
  },
}, { timestamps: true });

module.exports = mongoose.model('AgentExecutionLog', AgentExecutionLogSchema);
