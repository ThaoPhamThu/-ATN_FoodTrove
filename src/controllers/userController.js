const User = require('../models/userModel');
const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const makeToken = require('uniqid')
const { uploadImages, removeImage } = require('../service/uploadFileService');
const { sendMail } = require('../utils/sendMail');
const crypto = require('crypto');


const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password || !phoneNumber) throw new ErrorHandler('Missing input!')
    const userEmail = await User.findOne({ email });
    if (userEmail) return next(new ErrorHandler('Email already exists, please enter another email!'))
    else {
        const token = makeToken()
        const emailEdited = btoa(email) + '@' + token
        const user = await User.create({ name, email: emailEdited, password, phoneNumber })
        if (user) {
            const html = `<h2>Register code:</h2><br /><blockquote>${token}</blockquote> `
            await sendMail({ email, html, subject: 'Confirm register account in FoodTrove' })
        }
        setTimeout(async () => {
            await User.deleteOne({ email: emailEdited })
        }, [300000])
        return res.json({
            success: user ? true : false,
            mes: user ? 'Please check your email to active account' : 'Some thing wrong'
        })
    }

})

const finalRegister = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params
    const notActiveEmail = await User.findOne({ email: new RegExp(`${token}$`) })
    if (notActiveEmail) {
        notActiveEmail.email = atob(notActiveEmail?.email?.split('@')[0])
        notActiveEmail.save()
    }
    return res.json({
        success: notActiveEmail ? true : false,
        mes: notActiveEmail ? 'Register successfully, please go login' : 'Some thing wrong'
    })

})

const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('Missing input', 400))
    }
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorHandler('Email does not exist', 401));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Incorrect password', 401));
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
        message: 'Signed out'
    })
});

const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;
    if (!email) throw new ErrorHandler('Missing email!')
    const user = await User.findOne({ email })
    if (!user) throw new ErrorHandler('User not found!')
    const resetToken = user.getPasswordResetToken()
    await user.save()
    const html = `Please click on the link below to change password. This link will expire after 15 minutes.
        <a href= ${process.env.FRONTEND_URL}/reset-password/${resetToken}>Click here</a> `
    const data = {
        email,
        html,
        subject: 'Change Password'
    }
    const rs = await sendMail(data)
    return res.status(200).json({
        success: true,
        mes: 'Please check your email'
    })
})

const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { password, token } = req.body;
    if (!password || !token) throw new ErrorHandler('Missing input!')
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } })
    if (!user) throw new ErrorHandler('Invalid reset token!')
    user.password = password
    user.passwordResetToken = undefined
    user.passwordChangedAt = Date.now()
    user.passwordResetExpires = undefined
    await user.save()
    return res.status(200).json({
        success: user ? true : false,
        mes: user ? 'Updated password' : 'Some thing wrong'
    })
})

const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
        path: 'cart',
        populate: {
            path: 'product',
            select: 'titleProduct finalprice price imagesProduct weightProduct ratingsProduct saleProduct'
        }
    }).populate('wishlist', 'titleProduct finalprice price imagesProduct weightProduct ratingsProduct saleProduct')
        ;

    res.status(200).json({
        success: true,
        user
    })
});

const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect'));
    }

    user.password = newPassword;
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

const getUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    return res.status(200).json({
        success: users ? true : false,
        users: users ? users : 'Some thing wrong'
    })

})

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
    updateWishlist,
    finalRegister,
    forgotPassword,
    resetPassword,
    getUsers
}