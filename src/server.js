const express = require('express');
const connectDatabase = require('./config/database');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const errorMiddleware = require('./middlewares/errors');
const cloudinary = require('cloudinary').v2;
const products = require('./routes/productRoute');
const auth = require('./routes/authRoute');
const payment = require('./routes/paymentRoute');
const order = require('./routes/orderRoute');
const upload = require('./routes/uploadFile');

const app = express();
const port = process.env.PORT || 8080;

//Connect database
connectDatabase();

//config req.body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Config Cookie
app.use(cookieParser());

// // Setting up cloudinary configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

//congig file upload
// app.use(fileUpload());

// Import all routes
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', payment);
app.use('/api/v1', order);
app.use('/api/v1', upload);

if (process.env.NODE_ENV === 'PRODUCTION') {
    app.use(express.static(path.join(__dirname, '../frontend/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    })
};


// Middleware to handle errors
app.use(errorMiddleware);

// Handle Uncaught exceptions
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down due to uncaught exception');
    process.exit(1)
});


(async () => {
    app.listen(port, () => {
        console.log(`On port ${port}`);
    });
})();

// Handle Unhandled Promise rejections
process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1)
    })
})
