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
const category = require('./routes/categoryRoute');
const categoryBlog = require('./routes/categoryBlogRoute');
const blog = require('./routes/blogRoute');

const app = express();
const port = process.env.PORT || 8080;

//Connect database
connectDatabase();

//config req.body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Config Cookie
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['POST', 'GET', 'PUT', 'DELETE']
}));

// Import all routes
app.use('/api/products', products);
app.use('/api/users', auth);
app.use('/api/v1/', payment);
app.use('/api/orders', order);
app.use('/api/categories', category);
app.use('/api/category-blogs', categoryBlog);
app.use('/api/blogs', blog);




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


const server = app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`)
})

// Handle Unhandled Promise rejections
process.on('unhandledRejection', err => {
  console.log(`ERROR: ${err.stack}`);
  console.log('Shutting down the server due to Unhandled Promise rejection');
  server.close(() => {
    process.exit(1)
  })
})
