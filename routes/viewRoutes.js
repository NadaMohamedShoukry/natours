const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLoggedIn);
//A route to access te templet
// get -> for rendering templates in the browser

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTourDetails);
router.get('/login', viewsController.getLoginForm);
module.exports = router;
