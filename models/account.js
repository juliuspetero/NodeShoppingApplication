const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const accountSchema = new Schema({
  createdOn: String,
  modifiedOn: String,
  accountId: String,
  subscriptionId: String,
  accountType: String,
  currencyCode: String,
  countryCode: String,
  accountStatus: String,
  name: String,
  shortDescription: String,
  longDescription: String,
  alertLevel: String,
  alertChannel: String,
  alertEmailAddress: String,
  alertPhoneNumber: String,
  callBackUri: String,
  balance: Number,
  accountPackage: String
});

module.exports = mongoose.model('Account', accountSchema, 'accounts');
