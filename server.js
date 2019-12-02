const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const port = process.env.PORT || 3000;

const app = express();

app.use('/images', express.static(path.join(__dirname, 'assets/uploads')));

// Allow cross origin resource sharing
app.use(cors());

app.use(bodyParser.json());

// Connection string attainable from MongODb website
const connectionString =
  'mongodb+srv://JuliusPetero:kyambogo45JP@@eventcluster-bhhfi.mongodb.net/ecommercesandbox?retryWrites=true&w=majority';

// Connect to the database
mongoose.connect(
  connectionString,
  // This is for backward compartibility
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  error => {
    if (error) {
      console.log(error);
    } else {
      console.log('Connected to MongoDb');
    }
  }
);

// All the routes
app.use('/', require('./routes/homeRoute'));
app.use('/api/accounts', require('./routes/accountRoute'));
app.use('/api/orders', require('./routes/orderRoute'));
app.use('/api/transactions', require('./routes/transactionRoute'));
app.use('/api/users', require('./routes/userRoute'));
app.use('/api/products', require('./routes/productRoute'));

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});
