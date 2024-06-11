const CategoryBlog = require('../models/categoryBlogModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const createCategoryBlog = catchAsyncErrors(async (req, res, next) => {
    const { title, slug } = req.body;
    const categoryBlog = await CategoryBlog.create({ title, slug });
    res.status(200).json({
        success: true,
        categoryBlog
    })
});


const getCategoryBlogs = catchAsyncErrors(async (req, res, next) => {
    const response = await CategoryBlog.find();

    return res.status(200).json({
        success: response ? true : false,
        categories: response ? response : 'Get category failed'
    })
});

const updateCategoryBlog = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const categoryBlog = await CategoryBlog.findByIdAndUpdate(id, req.body, { new: true });

    res.status(200).json({
        success: true,
        categoryBlog
    })
});

const deleteCategoryBlog = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const result = await CategoryBlog.findByIdAndDelete(id, req.body, { new: true });

    res.status(200).json({
        success: true,
        result
    })
});

module.exports = { createCategoryBlog, getCategoryBlogs, updateCategoryBlog, deleteCategoryBlog }