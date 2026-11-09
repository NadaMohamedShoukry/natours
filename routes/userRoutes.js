const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//router is a mini app and running this middleware will protect all the routes that come after it
router.use(authController.authenticate);

router.patch(
  '/updatePassword',

  authController.updatePassword,
);

router.patch('/updateMe', authController.authenticate, userController.updateMe);
router.delete(
  '/deleteMe',

  userController.deleteMe,
);

router.route('/me').get(userController.getMe, userController.getUser);

//authorize anly to admins
router.use(authController.authorize('admin'));
router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
