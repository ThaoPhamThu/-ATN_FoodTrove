const {sendMailCreateOrder} = require('../service/emailServide');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendMail = catchAsyncErrors(async (req, res, next) => {
  try {
    console.log('hello')
        await sendMailCreateOrder();

    res.status(200).json({
        success: true,
        message: 'Đã đăng xuất'
    })
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})
module.exports = { sendMail }