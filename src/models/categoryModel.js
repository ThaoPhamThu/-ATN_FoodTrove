const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
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

const Category = mongoose.model('category', categorySchema);
module.exports = Category;

