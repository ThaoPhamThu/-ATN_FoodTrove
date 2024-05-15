const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    nameProduct: {
        type: String,
        required: [true, 'Tên sản phẩm không được để trống'],
        trim: true,
        maxLength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
    },
    titleProduct: {
        type: String,
        required: [true, 'Tiêu đề sản phẩm không được để trống'],
    },
    priceProduct: {
        type: Number,
        required: [true, 'Giá không được để trống'],
        maxLength: [7, 'Giá không được vượt quá 7 ký tự'],
        default: 0.0
    },
    saleProduct: {
        type: Number,
    },
    finalPriceProduct: {
        type: Number,
    },
    descriptionProduct: {
        type: String,
        required: [true, 'Mô tả không được để trống'],
    },
    brandProduct: {
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
    imagesProduct: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Vui lòng chọn danh mục cho sản phẩm này'],
        enum: {
            values: [
                "Dairy & Bakery",
                "Fruits & Vegetable",
                "Snack & Spice",
                "Juice & Drinks",
                "Chicken & Meat",
                "Fast Food"
            ],
            message: 'Vui lòng chọn đúng danh mục cho sản phẩm'
        }
    },
    productSold: {
        type: Number,
        maxLength: [5, 'Số lượng không được vượt quá 5 ký tự'],
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
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const Product = mongoose.model('product', productSchema);
module.exports = Product;