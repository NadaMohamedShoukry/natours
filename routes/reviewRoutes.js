const express = require('express');

const router = express.Router();

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

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
