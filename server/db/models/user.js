const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 200
  },
  surName: {
    type: String,
    minLength: 2,
    maxLength: 200
  },
  firstName: {
    type: String,
    minLength: 2,
    maxLength: 200
  },
  middleName: {
    type: String,
    minLength: 2,
    maxLength: 200
  },
  image: {
    type: String,
    minLength: 2,
    maxLength: 300
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 100
  },
  salt: {
    type: String,
    minLength: 5,
    maxLength: 100
  },
  permission: {
    chat: {C: Boolean, R: Boolean, U: Boolean, D: Boolean },
    news: { C: Boolean, R: Boolean, U: Boolean, D: Boolean },
    settings: { C: Boolean, R: Boolean, U: Boolean, D: Boolean }
  }
}).pre('save', function(next){
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, (err, hash) => {
          if (err) return next(err);
          user.salt = salt;
          user.password = hash;

          next();
      });
  });
});

module.exports = mongoose.model('user', UserSchema);