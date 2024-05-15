const express = require('express');
const routerProduct = express.Router();
const { getProducts ,newProduct, getProductDetail, getAdminProducts, updateProduct, deleteProduct, createProductReview, getProductReviews, deleteReview} = require('../controllers/productController')
const uploadCloudProduct = require("../middlewares/cloudinaryProduct");
const { isAuthenticatedUser, authorizeRoles  } = require('../middlewares/auth');

routerProduct.route('/products').get(getProducts);
routerProduct.route('/product').get(getProductDetail);

routerProduct.route('/admin/product/new').post(uploadCloudProduct.array("imagesProduct", 10),isAuthenticatedUser, authorizeRoles('admin'), newProduct);
routerProduct.route('/admin/products').get(getAdminProducts);
routerProduct.route('/admin/product').put(uploadCloudProduct.array("imagesProduct", 10), isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
routerProduct.route('/admin/product').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

routerProduct.route('/review').put(isAuthenticatedUser, createProductReview)
routerProduct.route('/reviews').get(isAuthenticatedUser, getProductReviews)
routerProduct.route('/reviews').delete(isAuthenticatedUser, deleteReview)
module.exports = routerProduct;