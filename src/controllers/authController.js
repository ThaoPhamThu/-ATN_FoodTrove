const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const crypto = require('crypto');
const uploadAvatar = require('../service/uploadFileService');

const registerUser = catchAsyncErrors(async (req, res, next) => {

    let { name, email, password} = req.body;

    if (!name) {
        return next(new ErrorHandler('Tên không được để trống', 401))
    }
    if (!email) {
        return next(new ErrorHandler('Email không được để trống', 401))
    }
    if (!password) {
        return next(new ErrorHandler('Mật khẩu không được để trống', 401))
    }
    if (!avatar) {
        return next(new ErrorHandler('Hình đại diện không được để trống', 401))
    }

    const userEmail = await User.findOne({ email: email });
    if (userEmail) {
        return next(new ErrorHandler('Email đã tồn tại, vui lòng nhập email khác', 401))
    }

    const result = await uploadAvatar(req.files.avatar);
    console.log(result)


    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: result.public_id,
            url: result.secure_url
        }
    })

    sendToken(user, 200, res)

})

module.exports = {
    registerUser,
}