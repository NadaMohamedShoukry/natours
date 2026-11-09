const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// returns controller.
exports.deleteDocument = (Model) =>
  catchAsync(async (req, res, next) => {
    // no content
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with this ID', 404));
    return res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateDocument = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // return the newly updated tour
      runValidators: true,
    });
    if (!doc) return next(new AppError('No document found with this ID', 404));
    return res.status(200).json({
      status: 'success',
      message: 'Tour updated successfully.',
      data: {
        data: doc,
      },
    });
  });

exports.createDocument = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Document added successfully.',
      data: {
        data: doc,
      },
    });
  });

exports.getOneDocument = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    // not await here because we want it t be stored in a variable so we can manipulate it.
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    // await when the query is ready.
    const doc = await query;

    if (!doc) return next(new AppError('No document found with this ID', 404));
    return res.status(200).json({
      status: 'success',
      message: 'Document retrieved successfully.',
      data: {
        data: doc,
      },
    });
  });

exports.getAllDocuments = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested route to get reviews on tour (hack)
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //Execute the query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginathion();
    const docs = await features.query;

    //Send response
    return res.status(200).json({
      status: 'success',
      message: 'Documents retrieved successfully.',
      requestedAt: req.requestTime,
      result: docs.length,
      data: {
        data: docs,
      },
    });
  });
