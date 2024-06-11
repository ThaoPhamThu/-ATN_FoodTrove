const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { sendMailCreateOrder } = require('../service/emailService');

const newOrder = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const userCart = await User.findById(_id).select('cart').populate('cart.product', 'nameProduct finalprice imagesProduct');
    const orderItems = userCart?.cart?.map(el => ({
        product: el.product._id,
        quantity: el.quantity,
        price: el.price
    }));
    const itemsPrice = orderItems.reduce((sum, el) => el.price * el.quantity + sum, 0)
    const {
        shippingInfo,
        shippingPrice,
        paymentMethod
    } = req.body;
    const totalPrice = itemsPrice + shippingPrice;
    const order = await Order.create({
        shippingInfo,
        shippingPrice,
        paymentMethod,
        orderItems,
        itemsPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user.id
    });
    const userOrder = req.user.email;

    if (order) {
        await sendMailCreateOrder(userOrder);
    }

    res.status(200).json({
        success: true,
        order
    })
});


const getOrderDetail = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if (!order) {
        return next(new ErrorHandler('Không tìm thấy đơn hàng nào có ID này', 404))
    }

    res.status(200).json({
        success: true,
        order
    })
});

const myOrders = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const orders = await Order.find({ orderBy: _id });

    res.status(200).json({
        success: true,
        orders
    })
});

const allOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find()

    let totalquantity = 0;

    orders.forEach(order => {
        totalquantity += order.itemsPrice;
    })

    res.status(200).json({
        success: true,
        totalquantity,
        orders
    })
});

async function updateProductSold(id, quantity) {
    const product = await Product.findById(id);

    product.productSold += quantity;

    await product.save({ validateBeforeSave: false })
}

const updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if (order.orderStatus === 'Đã giao hàng') {
        return next(new ErrorHandler('Bạn đã giao đơn đặt hàng này', 400))
    }

    order.orderItems.forEach(async item => {
        await updateProductSold(item.product.id, item.quantity)
    })

    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();

    await order.save()

    res.status(200).json({
        success: true,
    })
});

const getMonthlyIncome = async (req, res, next) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {
        let income = await Order.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: { // $project : chỉ định các field mong muốn truy vấn.
                    month: { $month: "$createdAt" },
                    sales: "$totalPrice",
                },
            },
            {
                $group: { // $group: nhóm các document theo điều kiện nhất định
                    _id: "$month",
                    total: { $sum: "$sales" },
                },
            },
        ]);
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { newOrder, getOrderDetail, myOrders, allOrders, updateOrder, getMonthlyIncome }