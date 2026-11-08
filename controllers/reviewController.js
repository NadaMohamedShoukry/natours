const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // from protected route

  const review = await Review.create(req.body);

  return res.status(201).json({
    status: 'success',
    message: 'Review created successfully',
    data: {
      review,
    },
  });
});

exports.allReviews = catchAsync(async (req, res) => {
  const features = new APIFeatures(Review.find(), req.query)
    .sort()
    .paginathion();
  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    message: 'Reviews retrieved successfully.',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.review = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return next(new AppError('Review is not found!', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Review retrieved successfully.',
    data: {
      review,
    },
  });
});
