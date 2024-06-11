const express = require('express');
const routerOrder = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')
const {newOrder, getOrderDetail, myOrders, allOrders, updateOrder, getMonthlyIncome} = require('../controllers/orderController');

routerOrder.route('/new').post(isAuthenticatedUser, newOrder);
routerOrder.route('/me/:id').get(isAuthenticatedUser, getOrderDetail);
routerOrder.route('/me').get(isAuthenticatedUser, myOrders);

routerOrder.route('/admin').get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
routerOrder.route('/:id').put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder);
routerOrder.route('/admin/orders/income').get(getMonthlyIncome);


module.exports = routerOrder;