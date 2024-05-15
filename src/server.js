const express = require('express');
const connectDatabase = require('./config/database');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const errorMiddleware = require('./middlewares/errors');
const products = require('./routes/productRoute');
const auth = require('./routes/userRoute');
const payment = require('./routes/paymentRoute');
const order = require('./routes/orderRoute');
const email = require('./routes/emailRoute');

const app = express();
const port = process.env.PORT || 8080;

//Connect database
connectDatabase();

//config req.body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Config Cookie
app.use(cookieParser());

// Import all routes
app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', payment);
app.use('/api/v1', order);
app.use('api/v1', email);

// app.use(cors());
// app.options('*', cors());

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
  
    app.get('*', (req, res) =>
      res.sendFile(
        path.resolve(__dirname, '..', 'frontend', 'build', 'index.html')
      )
    );
  } else {
    app.get('/', (req, res) => {
      res.send('200');
    });
  }


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
