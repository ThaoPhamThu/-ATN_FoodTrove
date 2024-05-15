const cloudinary = require('../config/cloudinary') ;

const uploadImages = async (images) => {
    try {
        const uploadImages = [];
        for (let image of images) {
            const results = await cloudinary.uploader.upload(image);

            uploadImages.push({
                url: results.secure_url,
                public_id: results.public_id
            })
        }

        return uploadImages;

    } catch(error) {
        return {
            status: 'failes',
            error: JSON.stringify(error)
        }
    }
};

const removeImage = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result;

    } catch(error) {
        return {
            status: 'failes',
            error: JSON.stringify(error)
        }
    }
};

module.exports =  {uploadImages, removeImage}
