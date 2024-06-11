const express = require('express');
const routerBlog = express.Router();
const { createBlog, updateBlog, getBlogs, getBlog, deleteBlog, likeBlog, dislikeBlog } = require('../controllers/blogController')
const uploadCloudProduct = require("../middlewares/cloudinaryProduct");
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

routerBlog.route('/').get(getBlogs);
routerBlog.route('/new').post(uploadCloudProduct.array("imageBlog", 10), isAuthenticatedUser, authorizeRoles('admin'), createBlog);
routerBlog.route('/update/:bid').put(uploadCloudProduct.array("imageBlog", 10), isAuthenticatedUser, authorizeRoles('admin'), updateBlog);
routerBlog.route('/like/:bid').put(isAuthenticatedUser, likeBlog);
routerBlog.route('/dislike/:bid').put(isAuthenticatedUser, dislikeBlog);
routerBlog.route('/:bid').get(getBlog);
routerBlog.route('/:bid').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteBlog);






module.exports = routerBlog;