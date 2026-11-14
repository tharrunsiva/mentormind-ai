const mongoose = require('mongoose');

const ResourceBookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningResource',
    required: true,
  },
  isCompleted: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  bookmarkedAt: { type: Date, default: Date.now },
}, { timestamps: true });

ResourceBookmarkSchema.index({ user: 1, resource: 1 }, { unique: true });

module.exports = mongoose.model('ResourceBookmark', ResourceBookmarkSchema);
