const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    shippingInfor: {
        address: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
        },
        name: {
            type: String
        },
    },
    orderItems: [
        {
            quantity: Number,
            price: Number,
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product'
            }
        }
    ],
    paymentMethod: {
        type: String,
        required: true,
        enum: {
            values: [
                'Cash On Delivery',
                'Payment By Paypal',
            ],
            message: 'Please select payment method!'

        },
    },
    orderCode: String,
    totalPrice: Number,
    orderStatus: {
        type: String,
        enum: ['Cancelled', 'Processing', 'Processed-Delivered', 'Successful Delivery'],
        default: 'Processing'
    },
    noteOrder: String,
    orderBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveredAt: {
        type: Date
    },

},
    {
        timestamps: true
    }
)


const Order = mongoose.model('order', orderSchema);
module.exports = Order;