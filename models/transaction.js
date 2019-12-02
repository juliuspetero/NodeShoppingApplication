const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// This is the model of what the users should have
const transactionSchema = new Schema({
  id: String,
  userId: String,
  requestId: String,
  createdOn: String,
  status: String,
  batchId: String,
  amount: String,
  paymentProvider: String,
  userEmail: String,
  orderId: String,
  phone: String
});

module.exports = mongoose.model(
  'transactions',
  transactionSchema,
  'transactions'
);
