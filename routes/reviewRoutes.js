const express = require('express');

const router = express.Router({ mergeParams: true });

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// Post tour/12345/reviews  mergeParams will get the tourId fron tours router
// Post / -> reviews
router
  .route('/')
  .post(
    authController.authenticate,
    authController.authorize('user'),
    reviewController.createReview,
  )
  .get(
    authController.authenticate,
    authController.authorize('user'),
    reviewController.allReviews,
  );

router
  .route('/:id')
  .get(
    authController.authenticate,
    authController.authorize('user'),
    reviewController.review,
  );

module.exports = router;
