const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// This is the model of what the users should have
const userSchema = new Schema({
  id: String,
  email: String,
  phone: String,
  password: String,
  role: String
});

module.exports = mongoose.model('users', userSchema, 'users');
