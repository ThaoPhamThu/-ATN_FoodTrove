const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storageProduct = new CloudinaryStorage({
    cloudinary,
    allowedFormats: ['jpg', 'png'],
    params: {
      folder: 'products',
    }
  });
  
  const uploadCloudProduct = multer({ storage: storageProduct });

module.exports = uploadCloudProduct;
