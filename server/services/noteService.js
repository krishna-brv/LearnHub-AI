const mongoose = require('mongoose');
const Note = require('../models/Note');
const AppError = require('../utils/AppError');

class NoteService {
  /**
   * Get User Notes (Paginated & Filtered)
   */
  async getUserNotes(userId, queryParams) {
    const { page = 1, limit = 20, folder, courseId, tag, search, isStarred } = queryParams;

    const filter = { user: userId, isArchived: false };
    if (folder) filter.folder = folder;
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) filter.course = courseId;
    if (tag) filter.tags = tag;
    if (isStarred === 'true') filter.isStarred = true;

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [notes, total, folders] = await Promise.all([
      Note.find(filter).sort({ isStarred: -1, updatedAt: -1 }).skip(skip).limit(limitNum),
      Note.countDocuments(filter),
      Note.distinct('folder', { user: userId, isArchived: false })
    ]);

    return {
      notes,
      folders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get Note Details by ID
   */
  async getNoteById(userId, noteId) {
    const note = await Note.findOne({ _id: noteId, user: userId })
      .populate('course', 'title')
      .populate('lesson', 'title')
      .populate('linkedNotes', 'title folder');

    if (!note) {
      throw new AppError('Note not found.', 404);
    }

    return note;
  }

  /**
   * Create Personal Note
   */
  async createNote(userId, data) {
    const note = await Note.create({
      user: userId,
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      folder: data.folder || 'General',
      course: data.course && mongoose.Types.ObjectId.isValid(data.course) ? data.course : null,
      lesson: data.lesson && mongoose.Types.ObjectId.isValid(data.lesson) ? data.lesson : null,
      linkedNotes: data.linkedNotes || [],
      isStarred: data.isStarred || false
    });

    return note;
  }

  /**
   * Update Personal Note
   */
  async updateNote(userId, noteId, data) {
    data.lastEditedAt = new Date();

    const note = await Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!note) {
      throw new AppError('Note not found.', 404);
    }

    return note;
  }

  /**
   * Delete Note
   */
  async deleteNote(userId, noteId) {
    const note = await Note.findOneAndDelete({ _id: noteId, user: userId });
    if (!note) {
      throw new AppError('Note not found.', 404);
    }

    return { message: 'Note deleted successfully.' };
  }
}

module.exports = new NoteService();
