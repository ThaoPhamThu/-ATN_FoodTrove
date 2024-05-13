const cloudinary = require('../config/cloudinary') ;

const uploadAvatar = async (file) => {
    try {
        const uploadFile = [];

        const result = await cloudinary.uploader.upload(file);
        uploadFile.push({
            url: result.secure_url,
            publicId: result.public_id
        });

        return uploadFile;

    } catch(error) {
        return {
            status: 'failes',
            error: JSON.stringify(error)
        }
    }
}

module.exports = {
    uploadAvatar,
}