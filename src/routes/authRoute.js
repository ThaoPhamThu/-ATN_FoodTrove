const express = require('express');
const router = express.Router();
const { lookUser } = require('../middlewares/lookAccount');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const { registerUser } = require('../controllers/authController');

router.route('/register').post(registerUser);
// router.route('/login').post(lookUser, loginUser);


// router.get('/logout', logoutUser);
module.exports = router;