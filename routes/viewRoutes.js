const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

//A route to access te templet
// get -> for rendering templates in the browser

router.get('/', viewsController.getOverview);
router.get('/tour', viewsController.getTourDetails);

module.exports = router;
