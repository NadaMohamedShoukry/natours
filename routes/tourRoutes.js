const express = require('express');

const router = express.Router();

//tourController object will be the equivelent to exports object.
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);
// router.param('id', tourController.checkID);
router
  .route('/monthly-plan/:year')
  .get(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );
router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// Post tour/12345/reviews
// not the best way (duplicate code)
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.authenticate,
//     authController.authorize('user'),
//     reviewController.createReview,
//   );

// will first go to tour router then redirected to review router
router.use('/:tourId/reviews', reviewRouter);
module.exports = router;
