const mongoose = require('mongoose');

const GroupMessageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('GroupMessage', GroupMessageSchema);
