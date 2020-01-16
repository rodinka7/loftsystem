const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NewsSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  created_at: Date,
  user: {
    firstName: String,
    id: String,
    image: String,
    middleName: String,
    surName: String,
    username: String
  }
});

module.exports = mongoose.model('news', NewsSchema);