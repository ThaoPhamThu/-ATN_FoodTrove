const uploadAvatar = require('../service/uploadFileService');

const uploadFile = async (req,res) => {
    try {
        const result = await uploadAvatar(req.file.path)
    
        return res.status(200).json({
            message: "Upload successfully",
            data: result
        })
    } catch(error) {
        return res.status(400).json({
        message: error.message
})
    }
}

module.exports = {
    uploadFile,
}