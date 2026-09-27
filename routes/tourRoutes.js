const express = require('express');

const router = express.Router();

//tourController object will be the equivelent to exports object.
const tourController = require('../controllers/tourController');

router.param('id', tourController.checkID);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.checkBody, tourController.getTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
