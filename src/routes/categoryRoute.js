const express = require('express');
const routerCategory = express.Router();
const {createCategory, getCategories, updateCategory, deleteCategory} = require('../controllers/categoryController.js')
const { isAuthenticatedUser, authorizeRoles  } = require('../middlewares/auth.js');

routerCategory.route('/').post(isAuthenticatedUser, authorizeRoles('admin'), createCategory);
routerCategory.route('/').get(getCategories);
routerCategory.route('/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateCategory);
routerCategory.route('/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);

module.exports = routerCategory;