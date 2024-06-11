const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { uploadImages, removeImage } = require('../service/uploadFileService');
require('dotenv').config();


// Create new product   =>   products/api/admin/new
const createProduct = catchAsyncErrors(async (req, res, next) => {
    const images = req.files?.map((file) => file.path);

    const results = await uploadImages(images);

    req.files.imagesProduct = results;

    const data = {
        saleProduct: req.body.saleProduct,
        price: req.body.price,
        finalprice: req.body.price - (req.body.price * (req.body.saleProduct / 100)),
        titleProduct: req.body.titleProduct,
        subTitle: req.body.subTitle,
        descriptionProduct: req.body.descriptionProduct,
        brand: req.body.brand,
        weightProduct: req.body.weightProduct,
        slug: req.body.slug,
        imagesProduct: results,
        category: req.body.category,
        stock: req.body.stock,
        user: req.user.id
    }

    const product = await Product.create(data);

    res.status(201).json({
        success: product ? true : false,
        mes: product ? 'Create product successfully!' : 'Create product failed!'
    })
});

// Get all products   =>   /api/v1/products?keyword=apple
const getProducts = catchAsyncErrors(async (req, res, next) => {
    const queries = { ...req.query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    const formatedQueries = JSON.parse(queryString);


    //Filtering
    if (queries?.titleProduct) formatedQueries.titleProduct = { $regex: queries.titleProduct, $options: 'i' };
    if (queries?.category) formatedQueries.category = { $regex: queries.category, $options: 'i' };
    if (queries?.brand) formatedQueries.brand = { $regex: queries.brand, $options: 'i' };

    let queryObject = {}
    if (queries?.q) {
        delete formatedQueries.q
        queryObject = {
            $or: [
                { titleProduct: { $regex: queries.q, $options: 'i' } },
                { category: { $regex: queries.q, $options: 'i' } },
                { brand: { $regex: queries.q, $options: 'i' } },
                // { descriptionProduct: { $regex: queries.q, $options: 'i' } }
            ]
        }
    }
    const qr = { ...formatedQueries, ...queryObject }
    let queryCommand = Product.find(qr);

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
    const limit = +req.query.limit || 8;
    const skip = (page - 1) * limit;
    queryCommand.skip(skip).limit(limit);

    queryCommand.exec(async (err, response) => {
        if (err) throw new ErrorHandler(err.message);
        const counts = await Product.find(qr).countDocuments();
        return res.status(200).json({
            success: response ? true : false,
            counts,
            products: response ? response : 'Can not get products',

        })
    })



});

const getProductDetail = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.pid).populate({
        path: 'reviews',
        populate: {
            path: 'user',
            select: 'name avatar'
        }
    });

    if (!product) {
        return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
    }


    res.status(200).json({
        success: true,
        product
    })

});

const updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.pid);

    if (!product) {
        return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
    }

    let results = []
    if (req.files.length > 0) {

        // Deleting images associated with the product
        for (let i = 0; i < product.imagesProduct.length; i++) {
            await removeImage(product.imagesProduct[i])
        }

        const images = req.files.map((file) => file.path);

        results = await uploadImages(images);
    } else {
        results = product.imagesProduct
    }

    const data = {
        saleProduct: req.body.saleProduct,
        price: req.body.price,
        finalprice: req.body.price - (req.body.price * (req.body.saleProduct / 100)),
        titleProduct: req.body.titleProduct,
        descriptionProduct: req.body.descriptionProduct,
        brand: req.body.brand,
        weightProduct: req.body.weightProduct,
        stock: req.body.stock,
        subTitle: req.body.subTitle,
        slug: req.body.slug,
        imagesProduct: results,
        category: req.body.category,
        user: req.user.id
    }

    product = await Product.findByIdAndUpdate(req.params.pid, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    return res.status(201).json({
        success: product ? true : false,
        mes: product ? 'Update product successfully!' : 'Update product failed!'
    })

});

const deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.params.pid);
    console.log(product)
    if (!product) {
        return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
    }

    const deleteProduct = await Product.findByIdAndDelete(req.params.pid)

    res.status(200).json({
        success: deleteProduct ? true : false,
        mes: deleteProduct ? 'Delete product successfully' : 'Delete product failed'
    })

});

const createProductReview = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const { rating, comment, productId, updatedAt } = req.body;
    if (!rating || !comment || !productId) throw new ErrorHandler('missing inputs')

    const ratingProduct = await Product.findById(productId);
    const alreadyRating = ratingProduct?.reviews?.find(el => el.user.toString() === _id.toString())


    if (alreadyRating) {
        await Product.updateOne({
            reviews: { $elemMatch: alreadyRating }
        }, {
            $set: { 'reviews.$.rating': rating, 'reviews.$.comment': comment, 'reviews.$.updatedAt': updatedAt }
        }, {
            new: true
        })
    } else {
        await Product.findByIdAndUpdate(productId, {
            $push: { reviews: { rating, comment, user: _id, updatedAt } }
        }, { new: true })
    }

    const updatedProduct = await Product.findById(productId)
    const numOfReviews = updatedProduct.reviews.length;
    updatedProduct.numOfReviews = numOfReviews;
    const sumRatings = updatedProduct.reviews.reduce((acc, item) => +item.rating + acc, 0);
    updatedProduct.ratingsProduct = Math.round(sumRatings * 10 / numOfReviews) / 10;
    await updatedProduct.save();

    return res.status(200).json({
        success: true,
        updatedProduct
    })

});

const getProductReviews = catchAsyncErrors(async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        res.status(200).json({
            success: true,
            reviews: product.reviews
        })
    } catch (error) {
        res.status(200).json({
            message: 'Không tìm thấy review với id'
        })
    }
});

const deleteReview = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    console.log(product);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratingsProduct = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratingsProduct,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
});



module.exports = { getProducts, createProduct, getProductDetail, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReview }
