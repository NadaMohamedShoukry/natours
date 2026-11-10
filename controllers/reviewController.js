const Review = require('../models/reviewModel');

const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; // from protected route
  next();
};
exports.createReview = factory.createDocument(Review);

exports.allReviews = factory.getAllDocuments(Review);

exports.review = factory.getOneDocument(Review);
exports.updateReview = factory.updateDocument(Review);
exports.deleteReview = factory.deleteDocument(Review);
