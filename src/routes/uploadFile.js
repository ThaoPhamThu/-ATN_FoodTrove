const express = require('express');
const routerUpload = express.Router();
const { uploadFile } = require('../controllers/uploadFileController');
const uploadCloud = require("../middlewares/cloudinary")

routerUpload.post('/upload',uploadCloud.single("avatar"), uploadFile)

module.exports = routerUpload;