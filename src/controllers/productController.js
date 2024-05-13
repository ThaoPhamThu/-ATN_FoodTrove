const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures')

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


module.exports = { getProducts }
