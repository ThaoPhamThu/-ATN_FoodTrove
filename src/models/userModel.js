const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { type } = require('os');
require('dotenv').config();

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên không được để trống'],
    },
    email: {
        type: String,
        required: [true, 'Email không được để trống'],
    },
    password: {
        type: String,
        required: [true, 'Mật khẩu không được để trống'],
        select: false
    },
    phoneNumber: {
        type: Number,
        required: [true, 'Số điện thoại không được để trống'],
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/djdjwg9zz/image/upload/v1716441301/vweuz5dzmz7fglnbgfy6.jpg'
    },
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        quantity: Number,
        price: Number
    }],
    address: String,
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }
    ],
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

},
    {
        timestamps: true
    })

// Encrypting password before saving user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

// Compare user password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// Return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000

    return resetToken

}

const User = mongoose.model('user', userSchema);
module.exports = User;