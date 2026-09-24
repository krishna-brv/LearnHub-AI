const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const AppError = require('../utils/AppError');

class BookmarkService {
  /**
   * Create or Toggle Bookmark
   */
  async toggleBookmark(userId, data) {
    const resourceType = data.resourceType || 'lesson';
    const resourceId = data.resourceId || new mongoose.Types.ObjectId();
    const title = data.title || 'Saved Bookmark';
    const notes = data.notes || data.note || '';

    let course = null;
    if (data.course && mongoose.Types.ObjectId.isValid(data.course)) {
      course = data.course;
    }

    const bookmark = await Bookmark.create({
      user: userId,
      resourceType,
      resourceId,
      course,
      title,
      notes
    });

    return { isBookmarked: true, bookmark, message: 'Bookmark saved!' };
  }

  /**
   * Get User Bookmarks
   */
  async getUserBookmarks(userId, resourceType) {
    const filter = { user: userId };
    if (resourceType) filter.resourceType = resourceType;

    const bookmarks = await Bookmark.find(filter)
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 });

    return bookmarks;
  }

  /**
   * Delete Bookmark by ID
   */
  async deleteBookmark(userId, bookmarkId) {
    const bookmark = await Bookmark.findOneAndDelete({ _id: bookmarkId, user: userId });
    if (!bookmark) {
      throw new AppError('Bookmark not found.', 404);
    }
    return { message: 'Bookmark deleted successfully.' };
  }
}

module.exports = new BookmarkService();
