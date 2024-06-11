const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    titleProduct: {
        type: String,
        required: true,
        trim: true
    },
    subTitle: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: [true, 'Giá không được để trống'],
    },
    saleProduct: {
        type: Number,
        required: [true, 'Sale không được để trống'],
    },
    finalprice: {
        type: Number,
    },
    descriptionProduct: {
        type: String,
        required: [true, 'Mô tả không được để trống'],
    },
    brand: {
        type: String,
        required: [true, 'Thương hiệu không được để trống'],
    },
    weightProduct: {
        type: String,
        required: [true, 'Trọng lượng không được để trống'],
    },
    ratingsProduct: {
        type: Number,
        default: 0
    },
    slug: String,
    imagesProduct: Array,
    category: String,
    stock: {
        type: Number,
        required: [true, 'Stock không được để trống'],
    },
    productSold: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'user',
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            updatedAt: { type: Date }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
},
    {
        timestamps: true
    })
const Product = mongoose.model('product', productSchema);
module.exports = Product;