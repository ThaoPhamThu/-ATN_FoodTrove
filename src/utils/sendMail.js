const nodeMailer = require('nodemailer');

const adminEmail = 'phamthuthao13a22014.2015@gmail.com';
const adminPassword = 'rqxr dlhr dqxa iyur';

const mailHost = 'smtp.gmail.com';
const mailPort = 587;

const sendMail = async ({ email, subject, html }) => {

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
        to: email, // địa chỉ gửi đến
        subject: subject, // Tiêu đề của mail
        html: html
    };

    await transporter.sendMail(options)
}
module.exports = { sendMail }