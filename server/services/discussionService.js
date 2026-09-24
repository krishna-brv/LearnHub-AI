const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');
const Course = require('../models/Course');
const AppError = require('../utils/AppError');

class DiscussionService {
  /**
   * Get Discussions (Global or Course-Specific)
   */
  async getCourseDiscussions(courseId, queryParams = {}) {
    const { page = 1, limit = 15, search, type, lessonId, category } = queryParams;

    const filter = { isVisible: true };
    if (courseId) filter.course = courseId;
    if (type) filter.type = type;
    if (lessonId) filter.lesson = lessonId;
    if (category) filter.category = category;

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [discussions, total] = await Promise.all([
      Discussion.find(filter)
        .populate('author', 'firstName lastName profile.avatar role')
        .sort({ isPinned: -1, lastActivityAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Discussion.countDocuments(filter)
    ]);

    return {
      discussions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get Discussion with Comments
   */
  async getDiscussionDetails(discussionId) {
    const discussion = await Discussion.findById(discussionId)
      .populate('author', 'firstName lastName profile.avatar role')
      .populate('course', 'title instructor');

    if (!discussion || !discussion.isVisible) {
      throw new AppError('Discussion post not found.', 404);
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    // Fetch threaded comments
    const comments = await Comment.find({ discussion: discussionId, isVisible: true })
      .populate('author', 'firstName lastName profile.avatar role')
      .sort({ isAnswer: -1, createdAt: 1 });

    const discussionObj = discussion.toObject();
    discussionObj.comments = comments;

    return discussionObj;
  }

  /**
   * Create Discussion Post
   */
  async createDiscussion(authorId, courseId, data) {
    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        throw new AppError('Course not found.', 404);
      }
    }

    const discussion = await Discussion.create({
      course: courseId || null,
      author: authorId,
      title: data.title,
      content: data.content,
      category: data.category || 'General',
      type: data.type || 'discussion',
      lesson: data.lesson || null,
      tags: data.tags || []
    });

    return discussion;
  }

  /**
   * Upvote / Downvote Discussion
   */
  async toggleUpvote(discussionId, userId) {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      throw new AppError('Discussion not found.', 404);
    }

    const index = discussion.upvotes.indexOf(userId);
    if (index >= 0) {
      discussion.upvotes.splice(index, 1);
    } else {
      discussion.upvotes.push(userId);
    }

    discussion.upvoteCount = discussion.upvotes.length;
    await discussion.save();

    return { upvoteCount: discussion.upvoteCount, isUpvoted: index < 0 };
  }

  /**
   * Add Comment to Discussion
   */
  async addComment(authorId, discussionId, data) {
    const discussion = await Discussion.findById(discussionId);
    if (!discussion || discussion.isLocked) {
      throw new AppError('Discussion not found or is locked for comments.', 400);
    }

    const comment = await Comment.create({
      discussion: discussionId,
      author: authorId,
      content: data.content,
      parentComment: data.parentComment || null
    });

    // Update Discussion metadata
    await discussion.save();

    // Send Notification to discussion author if different user
    if (discussion.author && discussion.author.toString() !== authorId.toString()) {
      try {
        const notificationService = require('./notificationService');
        await notificationService.notify({
          user: discussion.author,
          type: 'forum',
          title: 'New Reply on Your Question',
          message: `Someone commented on your post "${discussion.title.substring(0, 30)}...".`,
          link: '/discussions',
          priority: 'medium'
        });
      } catch (notifErr) {
        console.warn('⚠️ Could not send discussion notification:', notifErr.message);
      }
    }

    return comment;
  }

  /**
   * Mark Comment as Accepted Answer
   */
  async markCommentAsAnswer(commentId, instructorId) {
    const comment = await Comment.findById(commentId).populate('discussion');
    if (!comment) {
      throw new AppError('Comment not found.', 404);
    }

    const course = await Course.findById(comment.discussion.course);
    if (course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Only the course instructor can mark accepted answers.', 403);
    }

    // Reset previous answer
    await Comment.updateMany({ discussion: comment.discussion._id }, { isAnswer: false });

    comment.isAnswer = true;
    await comment.save();

    await Discussion.findByIdAndUpdate(comment.discussion._id, { isAnswered: true });

    return { message: 'Comment marked as accepted answer.', comment };
  }
}

module.exports = new DiscussionService();
