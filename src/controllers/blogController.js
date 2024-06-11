const Blog = require('../models/blogModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const { uploadImages, removeImage } = require('../service/uploadFileService');

const createBlog = catchAsyncErrors(async (req, res, next) => {
   const { title, subtitle, description, category, author } = req.body;

   const imageBlog = req.files[0]?.path;
   if (imageBlog) req.body.imageBlog = imageBlog
   const blog = await Blog.create(req.body);

   return res.status(200).json({
      success: blog ? true : false,
      blog: blog ? blog : 'Cannot create blog'
   })
});

const updateBlog = catchAsyncErrors(async (req, res, next) => {
   const { bid } = req.params
   const blog = await Blog.findById(bid);
   if (!blog) throw new ErrorHandler('Blog is not found')
   const { title, subtitle, description, category } = req.body;

   let results = ''
   if (req.files.length > 0) {

      // Deleting images associated with the product
      await removeImage(blog.imageBlog)

      const imageBlog = req.files[0]?.path;
      results = imageBlog
   } else {
      results = blog.imageBlog

   }
   const newBlogData = { title, subtitle, description, category, imageBlog: results }

   const newBlog = await Blog.findByIdAndUpdate(bid, newBlogData, { new: true });

   return res.status(200).json({
      success: newBlog ? true : false,
      mes: newBlog ? 'Update blog successfully' : 'Update blog failed'
   })

});

const likeBlog = catchAsyncErrors(async (req, res, next) => {
   const { _id } = req.user;
   const { bid } = req.params;
   const blog = await Blog.findById(bid);
   if (!blog) throw new ErrorHandler('Blog is not found')
   const alreadyDisliked = blog?.dislikes?.find(el => el.toString() === _id.toString())
   if (alreadyDisliked) {
      const response = await Blog.findByIdAndUpdate(bid, { $pull: { dislikes: _id } }, { new: true })
   }
   const alreadyLiked = blog?.likes?.find(el => el.toString() === _id.toString());
   if (alreadyLiked) {
      const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true });
      return res.status(200).json({
         success: response ? true : false,
         mes: response ? 'Removed like blog' : 'Some thing wrong'
      })
   } else {
      const response = await Blog.findByIdAndUpdate(bid, { $push: { likes: _id } }, { new: true });
      return res.status(200).json({
         success: response ? true : false,
         mes: response ? 'Like blog' : 'Some thing wrong'
      })
   }
});

const dislikeBlog = catchAsyncErrors(async (req, res, next) => {
   const { _id } = req.user;
   const { bid } = req.params;
   const blog = await Blog.findById(bid);
   if (!blog) throw new ErrorHandler('Blog is not found')
   const alreadyLiked = blog?.likes?.find(el => el.toString() === _id.toString())
   if (alreadyLiked) {
      const response = await Blog.findByIdAndUpdate(bid, { $pull: { likes: _id } }, { new: true })
   }
   const alreadyDisliked = blog?.dislikes.find(el => el.toString() === _id.toString());
   if (alreadyDisliked) {
      const response = await Blog.findByIdAndUpdate(bid, { $pull: { dislikes: _id } }, { new: true });
      return res.status(200).json({
         success: response ? true : false,
         mes: response ? 'Removed dislike blog' : 'Some thing wrong'
      })
   } else {
      const response = await Blog.findByIdAndUpdate(bid, { $push: { dislikes: _id } }, { new: true });
      return res.status(200).json({
         success: response ? true : false,
         mes: response ? 'defaultisliked blog' : 'Some thing wrong'
      })
   }
});

const getBlogs = catchAsyncErrors(async (req, res, next) => {
   const queries = { ...req.query };
   const excludeFields = ['limit', 'sort', 'page', 'fields'];
   excludeFields.forEach(el => delete queries[el]);

   let queryString = JSON.stringify(queries);
   queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
   const formatedQueries = JSON.parse(queryString);


   //Filtering
   if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' };
   if (queries?.category) formatedQueries.category = { $regex: queries.category, $options: 'i' };

   let queryObject = {}
   if (queries?.q) {
      delete formatedQueries.q
      queryObject = {
         $or: [
            { title: { $regex: queries.q, $options: 'i' } },
            { category: { $regex: queries.q, $options: 'i' } },
         ]
      }
   }
   const qr = { ...formatedQueries, ...queryObject }
   let queryCommand = Blog.find(qr);

   //Sorting
   if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join('');
      queryCommand = queryCommand.sort(sortBy);
   }

   //Field Limiting
   if (req.query.fields) {
      const fields = req.query.fields.split(',').join('');
      queryCommand = queryCommand.select(fields);
   }

   //pagination
   const page = +req.query.page || 1;
   const limit = +req.query.limit || 6;
   const skip = (page - 1) * limit;
   queryCommand.skip(skip).limit(limit);

   queryCommand.exec(async (err, response) => {
      if (err) throw new ErrorHandler(err.message);
      const counts = await Blog.find(qr).countDocuments();
      return res.status(200).json({
         success: response ? true : false,
         counts,
         blogs: response ? response : 'Can not get blogs',

      })
   })


});

const getBlog = catchAsyncErrors(async (req, res, next) => {
   const { bid } = req.params;
   const response = await Blog.findByIdAndUpdate(bid, { $inc: { numberViews: 1 } }, { new: true });

   return res.status(200).json({
      success: response ? true : false,
      blog: response ? response : 'Something wrong'
   })
});

const deleteBlog = catchAsyncErrors(async (req, res, next) => {
   const { bid } = req.params;
   const response = await Blog.findByIdAndDelete(bid)

   return res.status(200).json({
      success: response ? true : false,
      mes: response ? 'Deleted successfully' : 'Something wrong'
   })
});

module.exports = { createBlog, updateBlog, getBlogs, getBlog, deleteBlog, likeBlog, dislikeBlog }
