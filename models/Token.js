const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  access: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Token', TokenSchema);