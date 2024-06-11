const Category = require('../models/categoryModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

const createCategory = catchAsyncErrors(async (req, res, next) => {
   const { title, slug } = req.body;
   const category = await Category.create({ title, slug });
   res.status(200).json({
      success: true,
      category
   })
});


const getCategories = catchAsyncErrors(async (req, res, next) => {
   const response = await Category.find();

   return res.status(200).json({
      success: response ? true : false,
      categories: response ? response : 'Get category failed'
   })
});

const updateCategory = catchAsyncErrors(async (req, res, next) => {
   const { id } = req.params;
   const category = await Category.findByIdAndUpdate(id, req.body, { new: true });

   res.status(200).json({
      success: true,
      category
   })
});

const deleteCategory = catchAsyncErrors(async (req, res, next) => {
   const { id } = req.params;
   const result = await Category.findByIdAndDelete(id, req.body, { new: true });

   res.status(200).json({
      success: true,
      result
   })
});

module.exports = { createCategory, getCategories, updateCategory, deleteCategory }