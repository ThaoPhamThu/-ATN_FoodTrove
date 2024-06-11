const nodeMailer = require('nodemailer');

const adminEmail = 'foodtroveshop@gmail.com';
const adminPassword = 'uepo maau lole yaxn';

const mailHost = 'smtp.gmail.com';
const mailPort = 587;

const sendMailCreateOrder = async (userOrder) => {

    const transporter = nodeMailer.createTransport({
        host: mailHost,
        port: mailPort,
        secure: false,
        auth: {
            user: adminEmail,
            pass: adminPassword
          }
    });


    const options = {
        from: adminEmail, // địa chỉ admin email bạn dùng để gửi
        to: userOrder, // địa chỉ gửi đến
        subject: 'BẠN ĐÃ ĐẶT HÀNG THÀNH CÔNG', // Tiêu đề của mail
        html: '<b>Hello World</b>'
    };
    
 await transporter.sendMail(options)
}
module.exports = {sendMailCreateOrder}