const express = require('express');

const router = express.Router();

//tourController object will be the equivelent to exports object.
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);
// router.param('id', tourController.checkID);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/')
  .get(authController.authenticate, tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.authenticate,
    authController.authorize('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
