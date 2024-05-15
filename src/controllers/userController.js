const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const crypto = require('crypto');
const {uploadImages, removeImage} = require('../service/uploadFileService');

const registerUser = catchAsyncErrors(async (req, res, next) => {

    let { name, email, password, phoneNumber} = req.body;

    const userEmail = await User.findOne({ email: email });
    if (userEmail) {
        return next(new ErrorHandler('Email đã tồn tại, vui lòng nhập email khác', 401))
    } else {
        const images = req.files.map((file) => file.path);

        const result = await uploadImages(images);
    
        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            avatar: {
                public_id: result[0].public_id,
                url: result[0].url
            }
        })

        sendToken(user, 200, res)
    }
});

const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return next(new ErrorHandler('Email và Mật khẩu không được để trống', 400))
    }

    // Finding user in database
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Email không tồn tại', 401));
    }

    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Mật khẩu không đúng', 401));
    }

    sendToken(user, 200, res)
});

const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Đã đăng xuất'
    })
});

const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
});

const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Mật khẩu cũ không đúng'));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res)

});

const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // Update avatar
    if (req.file !== '') {
        const user = await User.findById(req.user.id)

        const image_id = user.avatar.public_id;
        console.log(image_id)

        const res = await removeImage(image_id);

        const images = req.files.map((file) => file.path);

        const result = await uploadImages(images);

        newUserData.avatar = {
            public_id: result[0].public_id,
            url: result[0].url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
});

const allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updatePassword,
    updateProfile,
    allUsers,
}