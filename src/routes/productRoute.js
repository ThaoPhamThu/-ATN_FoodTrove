const express = require('express');
const routerProduct = express.Router();
const { getProducts, createProduct, getProductDetail, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReview, getAllProducts } = require('../controllers/productController')
const uploadCloudProduct = require("../middlewares/cloudinaryProduct");
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

routerProduct.route('/').get(getProducts);
routerProduct.route('/admin').get(getAllProducts);
routerProduct.route('/:pid').get(getProductDetail);


routerProduct.route('/new').post(uploadCloudProduct.array("imagesProduct", 10), isAuthenticatedUser, authorizeRoles('admin'), createProduct);
routerProduct.route('/update/:pid').put(uploadCloudProduct.array("imagesProduct", 10), isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
routerProduct.route('/delete/:pid').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

routerProduct.route('/reviews').put(isAuthenticatedUser, createProductReview)
routerProduct.route('/reviews/:id').get(isAuthenticatedUser, getProductReviews)
routerProduct.route('/reviews').delete(isAuthenticatedUser, deleteReview)
module.exports = routerProduct;