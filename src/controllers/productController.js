const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
const {uploadImages, removeImage} = require('../service/uploadFileService');

// Get all products   =>   /api/v1/products?keyword=apple
const getProducts = catchAsyncErrors(async (req, res, next) => {

    const resPerPage = 12;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()

    let products = await apiFeatures.query;
    let filteredProductsCount = products.length;

    apiFeatures.pagination(resPerPage)
    products = await apiFeatures.query;


    setTimeout(function () {
        res.status(200).json({
            success: true,
            productsCount,
            resPerPage,
            filteredProductsCount,
            products
        })
    }, 2000)
})

// Create new product   =>   /api/v1/admin/product/new
const newProduct = catchAsyncErrors(async (req, res, next) => {
    const images = req.files.map((file) => file.path);
        
    const results = await uploadImages(images);

    req.files.imagesProduct = results;
    
    req.body.user = req.user.id;

    const data = {
        nameProduct: req.body.nameProduct,
		saleProduct: req.body.saleProduct,
		priceProduct: req.body.priceProduct,
		finalPriceProduct: req.body.priceProduct - (req.body.priceProduct * (req.body.saleProduct/100)),
		titleProduct: req.body.titleProduct,
		descriptionProduct: req.body.descriptionProduct,
		brandProduct: req.body.brandProduct,
		weightProduct: req.body.weightProduct,
		ratingsProduct: 5,
		imagesProduct: results,
		category: req.body.category,
		productSold: 0,
        user: req.user.id
    }

    const product = await Product.create(data);

    res.status(201).json({
        success: true,
        product
    })
});

const getProductDetail = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
    }


    res.status(200).json({
        success: true,
        product
    })

});

const getAdminProducts = catchAsyncErrors(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    })

});

const updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.query.id);

    if (!product) {
        return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
    }

    if (product.imagesProduct !== undefined) {

        // Deleting images associated with the product
        for (let i = 0; i < product.imagesProduct.length; i++) {
            const result = await removeImage(product.imagesProduct[i].public_id)
        }

        const images = req.files.map((file) => file.path);
        
        var results = await uploadImages(images);

        req.files.imagesProduct = results;


    }

    const data = {
        nameProduct: req.body.nameProduct,
		saleProduct: req.body.saleProduct,
		priceProduct: req.body.priceProduct,
		finalPriceProduct: req.body.priceProduct - (req.body.priceProduct * (req.body.saleProduct/100)),
		titleProduct: req.body.titleProduct,
		descriptionProduct: req.body.descriptionProduct,
		brandProduct: req.body.brandProduct,
		weightProduct: req.body.weightProduct,
		ratingsProduct: 5,
		imagesProduct: results,
		category: req.body.category,
        user: req.user.id
    }

    product = await Product.findByIdAndUpdate(req.query.id, data, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({
        success: true,
        product
    })

});

const deleteProduct = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.id);
    console.log(product)
    if (!product) {
        return next(new ErrorHandler('Không tìm thấy sản phẩm', 404));
    }

    // Deleting images associated with the product
    for (let i = 0; i < product.imagesProduct.length; i++) {
        const result = await removeImage(product.imagesProduct[i].public_id)
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: 'Xóa sản phẩm thành công'
    })

});

const createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratingsProduct = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

});

const getProductReviews = catchAsyncErrors(async (req, res, next) => {
    try {
        const product = await Product.findById(req.query.id);

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


module.exports = { getProducts, newProduct, getProductDetail, getAdminProducts, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReview  }
