// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    // photo: req.body.photo || '',
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  //secret key need to be 32 char long .. longer is better too
  // payload , secret , when it will expire
  //header is generated automaticly
  const token = signToken(newUser._id);
  return res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   1 - check if the email or password exist
  if (!email || !password) {
    return next(new AppError('Please enter your email or password!', 400));
  }
  //2 - check if the user exists and the password is correcct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password!', 401));
  }

  //  3- generate the token and send it to the user in response
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    message: 'User logged in successfully.',
    token,
  });
});

exports.authenticate = catchAsync(async (req, res, next) => {
  // 1 - get token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError('You are not logged in! Please login first.', 401),
    );
  }

  //2 - verify the token
  // made jwt.verify return a promise so we do not break the async flow
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3 - check if the user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exists!',
        401,
      ),
    );
  }
  //check if the user has recently changed their password
  // what if the user changed his password afer generatng the token ?
  // iat => issued at
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    next(
      new AppError(
        'User recently changed their password! Please log in again.',
        401,
      ),
    );
  }

  // Grand Access to Protected Route
  req.user = currentUser;
  next();
});
