const express = require('express');
const routerOrder = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')
const { newOrder, getOrderDetail, myOrders, allOrders, updateOrder, cancelOrder, getMonthlyIncome, getAllOrders } = require('../controllers/orderController');

routerOrder.route('/new').post(isAuthenticatedUser, newOrder);
routerOrder.route('/me/:oid').get(isAuthenticatedUser, getOrderDetail);
routerOrder.route('/me').get(isAuthenticatedUser, myOrders);
routerOrder.route('/me/:oid').put(isAuthenticatedUser, cancelOrder);

routerOrder.route('/admin').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
routerOrder.route('/admin/all').get(isAuthenticatedUser, authorizeRoles('admin'), getAllOrders);
routerOrder.route('/admin/:oid').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
routerOrder.route('/admin/income').get(getMonthlyIncome);


module.exports = routerOrder;