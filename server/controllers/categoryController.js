const asyncHandler = require('../middleware/asyncHandler');
const categoryService = require('../services/categoryService');
const { successResponse } = require('../utils/apiResponse');

exports.getCategories = asyncHandler(async (req, res) => {
  const tree = await categoryService.getCategoriesTree();
  return successResponse(res, 'Categories fetched successfully', { categories: tree });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const identifier = req.params.id || req.params.slug;
  const category = await categoryService.getCategoryByIdOrSlug(identifier);
  return successResponse(res, 'Category details fetched', { category });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(req.body);
  return successResponse(res, 'Category created successfully', { category }, 201);
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(req.params.id, req.body);
  return successResponse(res, 'Category updated successfully', { category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const result = await categoryService.deleteCategory(req.params.id);
  return successResponse(res, result.message);
});
