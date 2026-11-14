const { LearningResource, ResourceBookmark } = require('../models');

// @desc    Get all curated learning resources
// @route   GET /api/resources
// @access  Public
exports.getResources = async (req, res, next) => {
  try {
    const { skillName, platform, difficulty, search } = req.query;
    let query = {};

    if (skillName) query.skillName = new RegExp(`^${skillName}$`, 'i');
    if (platform) query.platform = platform;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const resources = await LearningResource.find(query).sort({ rating: -1 });

    // If user is authenticated, attach bookmarked status
    let userBookmarks = [];
    if (req.user) {
      const bookmarks = await ResourceBookmark.find({ user: req.user.id });
      userBookmarks = bookmarks.map((b) => b.resource.toString());
    }

    const enriched = resources.map((r) => ({
      ...r.toObject(),
      isBookmarked: userBookmarks.includes(r._id.toString()),
    }));

    res.status(200).json({ success: true, count: enriched.length, resources: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark for resource
// @route   POST /api/resources/:id/bookmark
// @access  Private
exports.toggleBookmark = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const existing = await ResourceBookmark.findOne({
      user: req.user.id,
      resource: resourceId,
    });

    if (existing) {
      await ResourceBookmark.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true, bookmarked: false, message: 'Bookmark removed.' });
    }

    const newBookmark = await ResourceBookmark.create({
      user: req.user.id,
      resource: resourceId,
    });

    res.status(201).json({ success: true, bookmarked: true, message: 'Resource bookmarked.', bookmark: newBookmark });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked resources
// @route   GET /api/resources/bookmarks
// @access  Private
exports.getMyBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await ResourceBookmark.find({ user: req.user.id })
      .populate('resource')
      .sort({ bookmarkedAt: -1 });

    res.status(200).json({ success: true, count: bookmarks.length, bookmarks });
  } catch (error) {
    next(error);
  }
};
