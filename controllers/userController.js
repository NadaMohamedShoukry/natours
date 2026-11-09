const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

const filteredObj = (obj, ...allowedFields) => {
  const newObj = {};
  // looping over the object to get the matched keys
  Object.keys(obj).forEach((el) => {
    // copy the matched fields
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

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

exports.getAllUsers = factory.getAllDocuments(User);
exports.getUser = factory.getOneDocument(User);

//The Admin can update the user from database.
//Update all data but not passwords
exports.updateUser = factory.updateDocument(User);
//The Admin can delete the user from database.
exports.deleteUser = factory.deleteDocument(User);
