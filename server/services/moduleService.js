const Module = require('../models/Module');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const AppError = require('../utils/AppError');

class ModuleService {
  /**
   * Get Modules for a Course
   */
  async getCourseModules(courseId) {
    const modules = await Module.find({ course: courseId }).sort({ order: 1 }).lean();
    for (const mod of modules) {
      mod.lessons = await Lesson.find({ module: mod._id }).sort({ order: 1 });
    }
    return modules;
  }

  /**
   * Create Module in Course
   */
  async createModule(courseId, data) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    const maxOrder = await Module.findOne({ course: courseId }).sort({ order: -1 });
    const nextOrder = data.order !== undefined ? data.order : (maxOrder ? maxOrder.order + 1 : 0);

    const moduleDoc = await Module.create({
      course: courseId,
      title: data.title,
      description: data.description || '',
      order: nextOrder,
      isPublished: data.isPublished !== undefined ? data.isPublished : true
    });

    // Update denormalized module count
    await Course.findByIdAndUpdate(courseId, { $inc: { totalModules: 1 } });

    return moduleDoc;
  }

  /**
   * Update Module
   */
  async updateModule(moduleId, data) {
    const moduleDoc = await Module.findByIdAndUpdate(moduleId, { $set: data }, { new: true, runValidators: true });
    if (!moduleDoc) {
      throw new AppError('Module not found.', 404);
    }
    return moduleDoc;
  }

  /**
   * Delete Module
   */
  async deleteModule(moduleId) {
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      throw new AppError('Module not found.', 404);
    }

    // Delete all lessons inside module
    await Lesson.deleteMany({ module: moduleId });
    await Module.findByIdAndDelete(moduleId);

    // Update course totalModules
    await Course.findByIdAndUpdate(moduleDoc.course, { $inc: { totalModules: -1 } });

    return { message: 'Module and its lessons deleted successfully.' };
  }

  /**
   * Reorder Modules (Drag & Drop)
   */
  async reorderModules(courseId, moduleOrders) {
    const bulkOps = moduleOrders.map((item) => ({
      updateOne: {
        filter: { _id: item.id, course: courseId },
        update: { $set: { order: item.order } }
      }
    }));

    await Module.bulkWrite(bulkOps);
    const updatedModules = await Module.find({ course: courseId }).sort({ order: 1 });
    return updatedModules;
  }
}

module.exports = new ModuleService();
