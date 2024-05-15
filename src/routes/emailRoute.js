const express = require('express');
const routerEmail = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth')
const {sendMail} = require('../controllers/emailController');

routerEmail.get('/send-mail',isAuthenticatedUser, authorizeRoles('admin'), sendMail);

module.exports = routerEmail