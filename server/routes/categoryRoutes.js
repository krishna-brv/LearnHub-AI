const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createCategoryValidator, updateCategoryValidator } = require('../validators/categoryValidator');

// Public Category Routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.post('/', createCategoryValidator, validate, categoryController.createCategory);
router.put('/:id', updateCategoryValidator, validate, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
