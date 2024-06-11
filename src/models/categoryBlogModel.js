const mongoose = require('mongoose');

const categoryBlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: String
},
    {
        timestamps: true
    });

const CategoryBlog = mongoose.model('categoryBlog', categoryBlogSchema);
module.exports = CategoryBlog;