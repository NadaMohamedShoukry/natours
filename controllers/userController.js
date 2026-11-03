const User = require('../models/userModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  // looping over the object to get the matched keys
  Object.keys(obj).forEach((el) => {
    // copy the matched fields
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //Send response
  return res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    result: users.length,
    data: {
      users,
    },
  });
});

// to make the user update his own data
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 - Create error if user POSTs password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('You are not allowed to update your password here', 400),
    );
  }

  // 3 - Update the user document

  // new : true -> to return the updated option instead of the old one.
  // runValidators: true to validate the document
  //filtered out unwaned field names.
  const filteredBody = filteredObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Data updated successfully.',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet provided!',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet provided!',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet provided!',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet provided!',
  });
};
