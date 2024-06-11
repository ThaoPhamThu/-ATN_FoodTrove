const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (uid, role) => jwt.sign({ id: uid, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
});

module.exports = { generateAccessToken }