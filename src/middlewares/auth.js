const User = require('../models/userModel')
require('dotenv').config();
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        const token = (req.headers.authorization).split(' ')[1]
        jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
            if (err) return res.status(401).json({
                success: false,
                mes: 'Invalid'
            })
            req.user = await User.findById(decode.id);
            next()
        })
    }
})

// Handling users roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(`(${req.user.role}) không có quyền truy cập tài nguyên này`, 403))
        }
        next()
    }
}