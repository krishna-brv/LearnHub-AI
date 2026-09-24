const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const slugify = require('slugify');

class CategoryService {
  /**
   * Get all active categories with subcategories
   */
  async getCategoriesTree() {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    // Build tree in memory
    const parents = categories.filter((c) => !c.parent);
    const result = parents.map((parent) => {
      const parentObj = parent.toObject();
      parentObj.subcategories = categories.filter((c) => c.parent && c.parent.toString() === parent._id.toString());
      return parentObj;
    });

    return result;
  }

  /**
   * Get Category by ID or Slug
   */
  async getCategoryByIdOrSlug(identifier) {
    if (!identifier) {
      throw new AppError('Category identifier is required.', 400);
    }
    const isId = typeof identifier === 'string' && Boolean(identifier.match(/^[0-9a-fA-F]{24}$/));
    const query = isId ? { _id: identifier } : { slug: identifier };

    const category = await Category.findOne(query).populate('parent', 'name slug');
    if (!category) {
      throw new AppError('Category not found.', 404);
    }
    return category;
  }

  /**
   * Create Category (Admin)
   */
  async createCategory(data) {
    const { name, description, parent, icon, color, order } = data;

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      throw new AppError('A category with this name already exists.', 400);
    }

    const slug = slugify(name, { lower: true, strict: true });

    const category = await Category.create({
      name,
      slug,
      description,
      parent: parent || null,
      icon,
      color,
      order: order || 0
    });

    return category;
  }

  /**
   * Update Category (Admin)
   */
  async updateCategory(categoryId, data) {
    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const category = await Category.findByIdAndUpdate(categoryId, { $set: data }, { new: true, runValidators: true });
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    return category;
  }

  /**
   * Delete Category (Admin)
   */
  async deleteCategory(categoryId) {
    // Check if category has subcategories
    const hasChildren = await Category.exists({ parent: categoryId });
    if (hasChildren) {
      throw new AppError('Cannot delete a category that has subcategories. Please reassign or delete them first.', 400);
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      throw new AppError('Category not found.', 404);
    }

    return { message: 'Category deleted successfully.' };
  }
}

module.exports = new CategoryService();
