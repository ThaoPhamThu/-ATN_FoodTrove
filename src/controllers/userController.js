const User = require('../models/userModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const crypto = require('crypto');
const { uploadImages, removeImage } = require('../service/uploadFileService');

const registerUser = catchAsyncErrors(async (req, res, next) => {

    let { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password || !phoneNumber)
        return res.status(400).json({
            success: false,
            mes: 'Missing inputs'
        })

    const userEmail = await User.findOne({ email: email });
    if (userEmail) {
        return next(new ErrorHandler('Email đã tồn tại, vui lòng nhập email khác', 401))
    } else {
        const images = req.file?.map((file) => file.path);

        const result = await uploadImages(images);

        const user = await User.create({
            name,
            email,
            password,
            phoneNumber,
            avatar: result[0]
        });
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
    const user = await User.findById(req.user.id).populate({
        path: 'cart',
        populate: {
            path: 'product',
            select: 'titleProduct finalprice price imagesProduct weightProduct'
        }
    }).populate('wishlist', 'titleProduct finalprice price imagesProduct weightProduct ratingsProduct');

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
        email: req.body.email,
        phoneNumber: req.body.phoneNumber
    }

    // Update avatar
    if (req.files !== '') {
        const user = await User.findById(req.user.id)

        const avatar = user.avatar;

        await removeImage(avatar[0]);

        const images = req.files.map((file) => file.path);

        const result = await uploadImages(images);

        newUserData.avatar = result[0]
    }

    const updateInfo = await User.findByIdAndUpdate(req.user.id, newUserData, { new: true })

    return res.status(200).json({
        success: updateInfo ? true : false,
        mes: updateInfo ? 'Update infor successfully' : 'Update infor failed'
    })
});

const allUsers = catchAsyncErrors(async (req, res, next) => {
    const queries = { ...req.query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    const formatedQueries = JSON.parse(queryString);


    //Filtering
    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };
    if (req.query.q) {
        delete formatedQueries.q
        formatedQueries['$or'] = [
            { name: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } }
        ]
    }
    let queryCommand = User.find(formatedQueries);

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
        const counts = await User.find(formatedQueries).countDocuments();
        return res.status(200).json({
            success: response ? true : false,
            counts,
            users: response ? response : 'Can not get products',

        })
    })

});

const updateUserCart = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const { pid, quantity = 1 } = req.body;
    const productCart = await Product.findById(pid);
    const price = productCart.finalprice;
    const user = await User.findById(_id).select('cart');
    const alreadyProduct = user?.cart.find(el => el.product.toString() === pid);
    if (alreadyProduct) {
        const response = await User.updateOne({ cart: { $elemMatch: alreadyProduct } }, { $set: { "cart.$.quantity": quantity, "cart.$.price": price } })
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Added product to cart' : 'Some thing wrong'
        })
    } else {
        const response = await User.findByIdAndUpdate(_id, { $push: { cart: { product: pid, quantity, price } } }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Added product to cart' : 'Some thing wrong'
        })
    }


});

const removeUserCart = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const { pid } = req.params;
    const user = await User.findById(_id).select('cart');
    const alreadyProduct = user?.cart.find(el => el.product.toString() === pid);
    if (!alreadyProduct) return res.status(200).json({
        success: true
    })

    const response = await User.findByIdAndUpdate(_id, { $pull: { cart: { product: pid } } }, { new: true });
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? 'Removed product to cart successfully' : 'Some thing wrong'
    })

});

const updateUser = catchAsyncErrors(async (req, res, next) => {
    const { uid } = req.params
    if (Object.keys(req.body).length === 0) throw new ErrorHandler('Missing input')
    const response = await User.findByIdAndUpdate(uid, req.body, { new: true })
    return res.status(200).json({
        success: response ? true : false,
        mes: response ? 'Updated!' : 'Something wrong!'
    })
});

const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const { uid } = req.params
    if (!uid) throw new ErrorHandler('Missing input')

    const response = await User.findByIdAndDelete(uid)

    return res.status(200).json({
        success: response ? true : false,
        mes: response ? `User with email ${response.email} deleted` : 'No user deleted'
    })
});

const updateWishlist = catchAsyncErrors(async (req, res, next) => {
    const { _id } = req.user;
    const { pid } = req.params;
    const productWishlist = await Product.findById(pid);
    const user = await User.findById(_id);
    const alreadyProduct = user?.wishlist.find(el => el.toString() === pid);
    if (alreadyProduct) {
        const response = await User.findByIdAndUpdate(_id, { $pull: { wishlist: pid } }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Added product to wishlist' : 'Some thing wrong'
        })
    } else {
        const response = await User.findByIdAndUpdate(_id, { $push: { wishlist: pid } }, { new: true });
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Removed product to wishlist' : 'Some thing wrong'
        })
    }


});


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    updatePassword,
    updateProfile,
    allUsers,
    updateUserCart,
    removeUserCart,
    updateUser,
    deleteUser,
    updateWishlist
}