const express = require('express');
const routerOrder = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')
const {newOrder, getOrderDetail, myOrders, allOrders, updateOrder, getMonthlyIncome} = require('../controllers/orderController');

routerOrder.route('/order/new').post(isAuthenticatedUser, newOrder);
routerOrder.route('/order').get(isAuthenticatedUser, getOrderDetail);
routerOrder.route('/orders/me').get(isAuthenticatedUser, myOrders);

routerOrder.route('/admin/orders/').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
routerOrder.route('/admin/order').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
routerOrder.route('/admin/orders/income').get(getMonthlyIncome);


module.exports = routerOrder;