// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

//Middleware
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

// Create a wrapper function that will return the middleware function.
// because we can not pass arguments in a middleware function.
exports.authorize =
  (...roles) =>
  // this middleware will have access to roles array because of cloures
  (req, res, next) => {
    // roles => ['admin' , 'lead-guide']
    //req.user.role this comming from this line  req.user = currentUser; in the authenticate middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not authorized to perform this action.', 403),
      );
    }
    next();
  };

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const createSendToken = (user, statusCode, message, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'success',
    message,
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    // photo: req.body.photo || '',
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  //secret key need to be 32 char long .. longer is better too
  // payload , secret , when it will expire
  //header is generated automaticly
  createSendToken(newUser, 201, 'User signed up successfully!', res);
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
  createSendToken(user, 200, 'User logged in successfully.', res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1-get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2- generate the random reset token
  const resetToken = user.createPasswordResetToken();
  //this will deactivate all the validators in our schema
  // because we have required fields
  await user.save({ validateBeforeSave: false });
  console.log('After save:', user.passwordResetToken);
  console.log(resetToken);

  //3- send this to the user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit your new password with the confirm password to this url ${resetURL}.\nIf you didn't forget your password please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token is valid for 10 min.',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully.',
    });
  } catch (err) {
    // reset the token and expires
    // modifies the data but does not save it
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // to save the data
    await user.save({ validateBeforeSave: false });
    console.error('EMAIL SENDING ERROR:', err);
    return next(
      new AppError(
        'Ther was an error sending this email. Try again later',
        500,
      ),
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1-  get the user based on token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2- if token has not expired and there is a new password set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  // reset the reset token and token expires
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // we won't stop the validators because we want the validators to validate the password.
  await user.save();

  // 3-update changedPasswrdAt property
  // did it in document middleware

  //4-Log the user in and send JWT
  createSendToken(user, 200, 'User logged in successfully.', res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 - get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2 - chech if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong!', 401));
  }
  //3 -if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate this will not work because the validators will not work with it
  // validators only work with save()
  // 4 - login the user with a new token
  createSendToken(user, 200, 'Password updated successfully!', res);
});
