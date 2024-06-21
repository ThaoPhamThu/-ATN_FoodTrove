const express = require('express');
const router = express.Router();
const { lookUser } = require('../middlewares/lookAccount');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { registerUser, finalRegister, loginUser, logoutUser, forgotPassword, resetPassword, getUserProfile, updatePassword, updateProfile, allUsers, updateUserCart, removeUserCart, updateUser, deleteUser, updateWishlist, getUsers } = require('../controllers/userController');
const uploadCloud = require("../middlewares/cloudinary");

router.route('/register').post(registerUser);
router.route('/finalregister/:token').put(finalRegister);
router.route('/login').post(lookUser, loginUser);
router.get('/logout', logoutUser);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword').put(resetPassword);
router.route('/infor').get(isAuthenticatedUser, getUserProfile);
router.route('/password-update').put(isAuthenticatedUser, updatePassword);
router.route('/infor').put(uploadCloud.array("avatar", 10), isAuthenticatedUser, updateProfile);
router.route('/cart').put(isAuthenticatedUser, updateUserCart);
router.route('/remove-cart/:pid').delete(isAuthenticatedUser, removeUserCart);
router.route('/wishlist/:pid').put(isAuthenticatedUser, updateWishlist);

router.route('/admin/all').get(isAuthenticatedUser, authorizeRoles('admin'), getUsers);
router.route('/admin').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);
router.route('/admin/:uid').put(isAuthenticatedUser, authorizeRoles('admin'), updateUser);
router.route('/admin/:uid').delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

module.exports = router;