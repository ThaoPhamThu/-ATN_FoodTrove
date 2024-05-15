const express = require('express');
const router = express.Router();
const { lookUser } = require('../middlewares/lookAccount');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { registerUser, loginUser, logoutUser, getUserProfile, updatePassword, updateProfile, allUsers } = require('../controllers/userController');
const uploadCloud = require("../middlewares/cloudinary");

router.route('/register').post(uploadCloud.array("avatar", 10), registerUser);
router.route('/login').post(lookUser, loginUser);
router.get('/logout', logoutUser);

router.route('/infor').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/infor/update').put(uploadCloud.array("avatar", 10), isAuthenticatedUser, updateProfile);

router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers);

module.exports = router;