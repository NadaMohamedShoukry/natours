const express = require('express');

const router = express.Router();

//tourController object will be the equivelent to exports object.
const tourController = require('../controllers/tourController');

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);
// router.param('id', tourController.checkID);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
