const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// This is the model of what the users should have
const orderSchema = new Schema({
  id: String,
  totalAmount: Number,
  phone: String,
  email: String,
  orderProducts: String,
  deliveryAddress: String,
  deliveryStatus: String,
  placedOn: String,
  paymentStatus: String,
  transactionId: String,
  userId: String
});

module.exports = mongoose.model('orders', orderSchema, 'orders');
