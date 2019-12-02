const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentProviderSchema = new Schema({
  paymentItemId: String,
  name: String,
  category: String,
  paymentRegex: String,
  paymentRegexStart: String,
  paymentId: String,
  isDeleted: Boolean,
  isActive: Boolean,
  longDescription: String,
  shortDescription: String,
  imageUri: String
});

module.exports = mongoose.model(
  'PaymentProvider',
  paymentProviderSchema,
  'paymentProviders'
);
