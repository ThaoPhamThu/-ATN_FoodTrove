const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const { sendMail } = require('../utils/sendMail');

const newOrder = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    let text = "";
    const char_list = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++) {
        text += char_list.charAt(Math.floor(Math.random() * char_list.length));
    }
    const {
        name,
        address,
        phoneNo,
        paymentMethod,
        noteOrder,
        orderItems,
        orderStatus,
        totalPrice
    } = req.body;
    if (address) {
        await User.findByIdAndUpdate(_id, { address, cart: [] })
    }
    const data = {
        shippingInfor: { name, address, phoneNo },
        paymentMethod,
        orderItems,
        totalPrice,
        noteOrder,
        orderCode: text,
        orderBy: _id
    }
    if (orderStatus) data.orderStatus = orderStatus
    const order = await Order.create(data);
    const userOrder = req.user.email;
    const subject = 'Order Success'
    const html = ''
    if (order) {
        await sendMail({ email: userOrder, html: html, subject: subject });
    }

    return res.status(200).json({
        success: order ? true : false,
        order
    })
});


const getOrderDetail = catchAsyncErrors(async (req, res, next) => {
    const { oid } = req.params
    const order = await Order.findById(oid).populate('user', 'name email').populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            select: 'titleProduct finalprice price imagesProduct weightProduct ratingsProduct saleProduct'
        }
    })

    if (!order) {
        return next(new ErrorHandler('Không tìm thấy đơn hàng nào có ID này', 404))
    }

    return res.status(200).json({
        success: order ? true : false,
        order: order ? order : 'Some thing wrong'
    })
});

const cancelOrder = catchAsyncErrors(async (req, res, next) => {
    const { oid } = req.params;
    const order = await Order.findByIdAndUpdate(oid, { orderStatus: 'Cancelled' });
    return res.status(200).json({
        success: order ? true : false,
        mes: order ? 'Order canceled successfully' : 'Some thing wrong'
    })
});

const myOrders = catchAsyncErrors(async (req, res, next) => {
    const queries = { ...req.query };
    const { _id } = req.user
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    const formatedQueries = JSON.parse(queryString);


    // Filtering
    if (queries?.orderStatus) formatedQueries.orderStatus = { $regex: queries.orderStatus, $options: 'i' };
    if (queries?.orderCode) formatedQueries.orderCode = { $regex: queries.orderCode, $options: 'i' };


    let queryObject = {}
    if (queries?.q) {
        delete formatedQueries.q
        queryObject = {
            $or: [
                { orderStatus: { $regex: queries.q, $options: 'i' } },
                { orderCode: { $regex: queries.q, $options: 'i' } },
            ]
        }
    }
    const qr = { ...formatedQueries, ...queryObject, orderBy: _id }
    let queryCommand = Order.find(qr).populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            select: 'titleProduct finalprice price imagesProduct weightProduct ratingsProduct saleProduct'
        }
    });

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
        const counts = await Order.find(qr).countDocuments();
        return res.status(200).json({
            success: response ? true : false,
            counts,
            orders: response ? response : 'Can not get orders',

        })
    })

});

const allOrders = catchAsyncErrors(async (req, res, next) => {
    const queries = { ...req.query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    const formatedQueries = JSON.parse(queryString);


    // Filtering
    if (queries?.orderStatus) formatedQueries.orderStatus = { $regex: queries.orderStatus, $options: 'i' };
    if (queries?.orderCode) formatedQueries.orderCode = { $regex: queries.orderCode, $options: 'i' };


    let queryObject = {}
    if (queries?.q) {
        delete formatedQueries.q
        queryObject = {
            $or: [
                { orderStatus: { $regex: queries.q, $options: 'i' } },
                { orderCode: { $regex: queries.q, $options: 'i' } },
            ]
        }
    }
    const qr = { ...formatedQueries, ...queryObject }
    let queryCommand = Order.find(qr).populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            select: 'titleProduct finalprice price imagesProduct weightProduct ratingsProduct saleProduct'
        }
    });

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
        const counts = await Order.find(qr).countDocuments();
        return res.status(200).json({
            success: response ? true : false,
            counts,
            orders: response ? response : 'Can not get orders',

        })
    })

});

const getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find();

    return res.status(200).json({
        success: orders ? true : false,
        orders: orders ? orders : 'Some thing wrong'
    })

})

async function updateProductSold(id, quantity) {
    const product = await Product.findById(id);

    product.productSold += quantity;

    await product.save({ validateBeforeSave: false })
}

const updateOrder = catchAsyncErrors(async (req, res, next) => {
    const { oid } = req.params
    const { orderStatus } = req.body
    const order = await Order.findById(oid)

    order.orderItems.forEach(async item => {
        await updateProductSold(item.product._id, item.quantity)
    })

    order.orderStatus = orderStatus;
    if (orderStatus === 'Processed-Delivered') order.deliveredAt = Date.now();

    await order.save()

    return res.status(200).json({
        success: order ? true : false,
        mes: 'Update status order successfully'
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
        res.status(200).json({
            success: income ? true : false,
            income: income ? income : 'Some thing wrong'
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = { newOrder, getOrderDetail, myOrders, allOrders, updateOrder, cancelOrder, getMonthlyIncome, getAllOrders }