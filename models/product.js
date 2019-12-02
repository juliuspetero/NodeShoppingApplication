const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// This is the model of what the event should have
const productSchema = new Schema({
  id: String,
  price: Number,
  name: String,
  description: String,
  photo: String
});

module.exports = mongoose.model('Product', productSchema, 'products');
