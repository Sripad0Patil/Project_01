const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  bank: String,
  branch: String,
  address: String
});

module.exports = mongoose.model('Account', accountSchema);
