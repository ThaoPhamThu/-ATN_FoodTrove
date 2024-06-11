const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems: [
        {
            quantity: Number,
            price: Number,
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        }
    ],
    paymentMethod: {
        type: String,
        default: 'Thanh toán bằng VNPay',
        enum: {
            values: [
                'Cash On Delivery',
                'Thanh toán bằng VNPay',
            ],
            message: 'Vui lòng chọn đúng phương thức thanh toán'

        },
    },
    totalPrice: Number,
    orderStatus: {
        type: String,
        enum: ['Cancelled', 'Proccessing', 'Successed'],
        default: 'Proccessing'
    },
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
    })

module.exports = mongoose.model('Order', orderSchema)