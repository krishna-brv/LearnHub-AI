const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const slugify = require('slugify');

class CourseService {
  /**
   * Create new course (Instructor)
   */
  async createCourse(instructorId, courseData) {
    const {
      title,
      description,
      shortDescription,
      thumbnail,
      previewVideo,
      category,
      subcategory,
      level,
      language,
      prerequisites,
      learningObjectives,
      tags,
      estimatedDuration
    } = courseData;

    // Verify category exists
    const cat = await Category.findById(category);
    if (!cat) {
      throw new AppError('Category not found.', 404);
    }

    // Generate unique slug
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Course.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const course = await Course.create({
      title,
      slug,
      description,
      shortDescription,
      thumbnail,
      previewVideo,
      instructor: instructorId,
      category,
      subcategory: subcategory || null,
      level: level || 'beginner',
      language: language || 'English',
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      tags: tags || [],
      estimatedDuration: estimatedDuration || 0,
      status: 'draft'
    });

    // Increment category course count
    await Category.findByIdAndUpdate(category, { $inc: { courseCount: 1 } });

    return course;
  }

  /**
   * Get all published courses (Catalog search/filter)
   */
  async getPublishedCourses(queryParams) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      subcategory,
      level,
      language,
      minRating,
      sort = 'popular',
      status
    } = queryParams;

    const filter = {};
    if (status === 'all') {
      // Include courses of any status
    } else if (status) {
      filter.status = status;
    } else {
      filter.status = 'published';
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (level) {
      filter.level = level;
    }

    if (language) {
      filter.language = language;
    }

    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Sorting strategy
    let sortOptions = {};
    if (sort === 'popular') sortOptions = { enrollmentCount: -1, averageRating: -1 };
    else if (sort === 'newest') sortOptions = { publishedAt: -1 };
    else if (sort === 'rating') sortOptions = { averageRating: -1, totalRatings: -1 };
    else if (sort === 'duration_asc') sortOptions = { estimatedDuration: 1 };
    else if (sort === 'duration_desc') sortOptions = { estimatedDuration: -1 };
    else sortOptions = { publishedAt: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructor', 'firstName lastName profile.avatar profile.headline')
        .populate('category', 'name slug icon')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(filter)
    ]);

    return {
      courses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    };
  }

  /**
   * Get Course Details by Slug or ID (with syllabus)
   */
  async getCourseDetails(slugOrId, currentUser = null) {
    if (!slugOrId) {
      throw new AppError('Course slug or ID is required.', 400);
    }
    const isId = typeof slugOrId === 'string' && Boolean(slugOrId.match(/^[0-9a-fA-F]{24}$/));
    const query = isId ? { _id: slugOrId } : { slug: slugOrId };

    const course = await Course.findOne(query)
      .populate('instructor', 'firstName lastName profile.avatar profile.headline profile.bio instructorProfile')
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    // Determine instructor ID string safely
    const instructorIdStr = course.instructor?._id
      ? course.instructor._id.toString()
      : course.instructor?.toString();

    const isOwner = Boolean(
      currentUser &&
      instructorIdStr &&
      currentUser._id &&
      instructorIdStr === currentUser._id.toString()
    );

    const isAdminOrReviewer = Boolean(
      currentUser && ['admin', 'reviewer'].includes(currentUser.role)
    );

    // If course is not published, check authorization
    if (course.status !== 'published') {
      if (!isOwner && !isAdminOrReviewer) {
        throw new AppError('This course is not currently published.', 403);
      }
    }

    // Fetch Modules & Lessons
    const modules = await Module.find({ course: course._id }).sort({ order: 1 });

    const lessonsFilter = { course: course._id };
    if (!isOwner && !isAdminOrReviewer) {
      lessonsFilter.isPublished = true;
    }

    const lessons = await Lesson.find(lessonsFilter).sort({ order: 1 });

    // Attach lessons to respective modules
    const syllabus = modules.map((mod) => {
      const modObj = mod.toObject();
      modObj.lessons = lessons.filter((l) => l.module.toString() === mod._id.toString());
      return modObj;
    });

    const courseObj = course.toObject();
    courseObj.syllabus = syllabus;

    return courseObj;
  }

  /**
   * Update Course (Instructor Owner)
   */
  async updateCourse(courseId, instructorId, updateData, userRole = 'instructor') {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (course.instructor.toString() !== instructorId.toString() && userRole !== 'admin') {
      throw new AppError('You are not authorized to edit this course.', 403);
    }

    // Instructors cannot directly change status via general update endpoint
    if (userRole !== 'admin') {
      delete updateData.status;
    }

    if (updateData.title && updateData.title !== course.title) {
      let baseSlug = slugify(updateData.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Course.exists({ slug, _id: { $ne: courseId } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    updateData.lastUpdatedContent = new Date();

    const updatedCourse = await Course.findByIdAndUpdate(courseId, { $set: updateData }, { new: true, runValidators: true });
    return updatedCourse;
  }

  /**
   * Submit Course for Review
   */
  async submitCourseForReview(courseId, instructorId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('You do not own this course.', 403);
    }

    if (!['draft', 'changes_requested', 'rejected'].includes(course.status)) {
      throw new AppError(`Cannot submit course with status '${course.status}'. Must be DRAFT, CHANGES_REQUESTED, or REJECTED.`, 400);
    }

    // Verify course has content before submission
    const moduleCount = await Module.countDocuments({ course: courseId });
    if (moduleCount === 0) {
      throw new AppError('Cannot submit course without modules. Please add at least one module.', 400);
    }

    const lessonCount = await Lesson.countDocuments({ course: courseId });
    if (lessonCount === 0) {
      throw new AppError('Cannot submit course without lessons. Please add at least one lesson to your modules.', 400);
    }

    course.status = 'submitted';
    await course.save();

    // Notify Content Reviewers & Admins
    try {
      const User = require('../models/User');
      const notificationService = require('./notificationService');
      const reviewers = await User.find({ role: { $in: ['reviewer', 'admin'] } });
      for (const rev of reviewers) {
        await notificationService.notify({
          user: rev._id,
          type: 'course_submitted',
          title: 'New Course Submitted for Review',
          message: `Instructor submitted course "${course.title}". Click to inspect and evaluate.`,
          link: '/reviewer/queue',
          priority: 'high'
        });
      }
    } catch (err) {
      console.warn('⚠️ Reviewer notification failed:', err.message);
    }

    return { message: 'Course submitted to Content Reviewers successfully.', course };
  }

  /**
   * Publish Approved Course
   */
  async publishCourse(courseId, userId, userRole = 'reviewer') {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (!['reviewer', 'admin'].includes(userRole)) {
      throw new AppError('Only Content Reviewers or Admins can make a course live.', 403);
    }

    course.status = 'published';
    course.publishedAt = new Date();
    await course.save();

    return { message: 'Course is now LIVE and published to catalog!', course };
  }

  /**
   * Archive Course
   */
  async archiveCourse(courseId, userId, userRole) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (course.instructor.toString() !== userId.toString() && userRole !== 'admin') {
      throw new AppError('Unauthorized to archive this course.', 403);
    }

    course.status = 'archived';
    await course.save();

    return { message: 'Course archived successfully.', course };
  }

  /**
   * Delete Draft Course
   */
  async deleteDraftCourse(courseId, instructorId) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Unauthorized to delete this course.', 403);
    }

    if (!['draft', 'rejected'].includes(course.status)) {
      throw new AppError('Only DRAFT or REJECTED courses can be deleted.', 400);
    }

    // Clean up modules & lessons
    await Module.deleteMany({ course: courseId });
    await Lesson.deleteMany({ course: courseId });
    await Course.findByIdAndDelete(courseId);

    // Decrement category count
    await Category.findByIdAndUpdate(course.category, { $inc: { courseCount: -1 } });

    return { message: 'Course deleted successfully.' };
  }

  /**
   * Get Instructor's Own Courses
   */
  async getInstructorCourses(instructorId) {
    const courses = await Course.find({ instructor: instructorId })
      .populate('category', 'name icon')
      .sort({ updatedAt: -1 });

    return courses;
  }

  /**
   * Get Review Queue for Curriculum Reviewers & Admins
   */
  async getReviewQueue() {
    const courses = await Course.find({
      status: { $in: ['submitted', 'under_review', 'changes_requested', 'rejected', 'approved', 'published'] }
    })
      .populate('instructor', 'firstName lastName email profile.avatar')
      .populate('category', 'name icon')
      .sort({ updatedAt: -1 });

    return courses;
  }

  /**
   * Review Course (Reviewer / Admin)
   */
  async reviewCourse(courseId, status, reviewNotes) {
    if (!['approved', 'published', 'changes_requested', 'rejected', 'under_review'].includes(status)) {
      throw new AppError('Invalid review status provided. Must be approved/published, changes_requested, rejected, or under_review.', 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    // Auto publish if approved
    if (status === 'approved' || status === 'published') {
      course.status = 'published';
      course.publishedAt = new Date();
    } else {
      course.status = status;
    }

    if (reviewNotes !== undefined) {
      course.reviewNotes = reviewNotes;
    }

    await course.save();

    // Notify instructor
    try {
      const notificationService = require('./notificationService');
      let notifTitle = 'Course Review Update';
      let notifMsg = `Your course "${course.title}" status has been updated to '${course.status}'.`;

      if (course.status === 'published') {
        notifTitle = '🎉 Course Approved & Published!';
        notifMsg = `Congratulations! Content Reviewer approved your course "${course.title}". It is now LIVE for students!`;
      } else if (course.status === 'changes_requested') {
        notifTitle = '⚠️ Changes Requested on Course';
        notifMsg = `Content Reviewer requested changes for "${course.title}": "${reviewNotes || 'Please review notes in Studio.'}"`;
      } else if (course.status === 'rejected') {
        notifTitle = '❌ Course Review Rejected';
        notifMsg = `Content Reviewer rejected "${course.title}": "${reviewNotes || 'Please review notes in Studio.'}"`;
      }

      await notificationService.notify({
        user: course.instructor,
        type: 'course_reviewed',
        title: notifTitle,
        message: notifMsg,
        link: `/instructor/course/${course._id}/studio`,
        priority: 'high',
        sendEmail: true
      });
    } catch (err) {
      console.warn('⚠️ Instructor review notification failed:', err.message);
    }

    return { message: `Course evaluation updated to '${course.status}' successfully.`, course };
  }

  /**
   * Send Instructor Announcement to Enrolled Students
   */
  async sendCourseAnnouncement(courseId, instructorId, announcementData) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }
    if (course.instructor.toString() !== instructorId.toString()) {
      throw new AppError('Only the course instructor can send announcements.', 403);
    }

    const { title, message } = announcementData;
    if (!title || !message) {
      throw new AppError('Announcement title and message are required.', 400);
    }

    const Enrollment = require('../models/Enrollment');
    const notificationService = require('./notificationService');
    const enrollments = await Enrollment.find({ course: courseId, status: { $in: ['active', 'completed'] } });

    let sentCount = 0;
    for (const e of enrollments) {
      try {
        await notificationService.notify({
          user: e.student,
          type: 'announcement',
          title: `Announcement: ${course.title}`,
          message: `${title}: ${message}`,
          link: `/learn/${courseId}`,
          priority: 'high',
          sendEmail: true
        });
        sentCount++;
      } catch (err) {
        console.warn('⚠️ Announcement notification error:', err.message);
      }
    }

    return { message: `Announcement sent to ${sentCount} enrolled students!`, sentCount };
  }
}

module.exports = new CourseService();
