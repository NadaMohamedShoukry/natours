const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false, // we do not want to show this flag in the output
  },
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
userSchema.pre('save', async function (next) {
  // if password is not modified or the document is already new ... return
  if (!this.isModified('password') || this.isNew) return next();

  // update the passwordChangedAt
  // we subtracted 1s because sometimes updateing the database takes sometime so updating the
  // passwordChangedAt may happen after the jwt has generated .. so that means that the user may not be able to
  // login right away
  // this makes sure that the token is generated after the password has changed
  // not 100% accurate but it solves the problem
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query Middleware
// Remove user with active = false
userSchema.pre(/^find/, function (next) {
  // this refers to the current query
  //query all the docs that has active:true and ignore active:false
  this.find({ active: { $ne: false } });
  next();
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

userSchema.methods.createPasswordResetToken = function () {
  // generate a token
  const resetToken = crypto.randomBytes(32).toString('hex'); // resetToken in hexa code

  // encrypt the token
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log({ resetToken }, this.passwordResetToken);
  return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;
