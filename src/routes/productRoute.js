const express = require('express');
const routerProduct = express.Router();
const { getProducts } = require('../controllers/productController')

const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

routerProduct.get('/products', getProducts);

module.exports = routerProduct;