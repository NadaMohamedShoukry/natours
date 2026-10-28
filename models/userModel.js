const mongoose = require('mongoose');

const validator = require('validator');

// eslint-disable-next-line import/no-extraneous-dependencies
const bycrpt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true, //convert email to lowercase
    validate: [validator.isEmail, 'Please enter a valid email.'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password.'],
    minLength: 8,
    select: false, // do not show it in any output
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password.'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: { type: Date },
});

//To encrypt the password
// Document Middleware
userSchema.pre('save', async function (next) {
  // if a field in the document is not modified
  // Only run it if password is modified
  if (!this.isModified('password')) {
    return next();
  }
  // cost => how CPU intensive the operation will be ,
  //  to make it hard to break the password
  // default is 10
  this.password = await bycrpt.hash(this.password, 12);

  // then delete tha confirmed password
  // we do not need it to be saved in the database
  this.passwordConfirm = undefined;
});

//Instance Methods that work on documents
userSchema.methods.correctPassword = async function (
  passedPassword,
  storedPassword,
) {
  return await bycrpt.compare(passedPassword, storedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, // to get time in seconds
      10, // base
    );
    console.log(changedTimeStamp, JWTTimestamp);
    return JWTTimestamp < changedTimeStamp;
  }

  return false; // no password changed
};
const User = mongoose.model('User', userSchema);
module.exports = User;
