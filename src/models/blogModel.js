const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    imageBlog: {
        type: String,
    },
    numberViews: {
        type: Number,
        default: 0
    },
    likes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        }
    ],
    author: {
        type: String,
        dafault: 'Admin'
    }
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })
const Blog = mongoose.model('blog', blogSchema);
module.exports = Blog;