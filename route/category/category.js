const express = require('express');
const { createCategoryCtrl, fetchCategoriesCtrl, fetchCategoryCtrl, updateCategoryCtrl, deleteCategory } = require('../../controllers/category/CategoryCtrl');
const authMiddleWare = require('../../middlewares/auth/authMiddleware');

const categoryRoute = express.Router();
categoryRoute.post('/', authMiddleWare, createCategoryCtrl);
categoryRoute.get('/',  fetchCategoriesCtrl);
categoryRoute.get('/:id', fetchCategoryCtrl);
categoryRoute.put('/:id', authMiddleWare, updateCategoryCtrl);
categoryRoute.delete('/:id', authMiddleWare, deleteCategory);

module.exports = categoryRoute