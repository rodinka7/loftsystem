const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 200
  }
});

module.exports = mongoose.model('refreshToken', tokenSchema);