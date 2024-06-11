const express = require('express');
const routerCategory = express.Router();
const { createCategoryBlog, getCategoryBlogs, updateCategoryBlog, deleteCategoryBlog } = require('../controllers/categoryBlogController.js')
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth.js');

routerCategory.route('/').post(isAuthenticatedUser, authorizeRoles('admin'), createCategoryBlog);
routerCategory.route('/').get(getCategoryBlogs);
routerCategory.route('/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateCategoryBlog);
routerCategory.route('/:id').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategoryBlog);

module.exports = routerCategory;