const mongoose = require('mongoose');

const PeerConnectionSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  compatibilityScore: { type: Number, default: 85 }, // 0 - 100%
  sharedGoals: [{ type: String }],
  complementarySkills: [{
    requesterTeaches: String,
    recipientTeaches: String,
  }],
  connectedAt: { type: Date },
}, { timestamps: true });

PeerConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

module.exports = mongoose.model('PeerConnection', PeerConnectionSchema);
