const express = require('express');

const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.authenticate,
  authController.updatePassword,
);

router.patch('/updateMe', authController.authenticate, userController.updateMe);
router.delete(
  '/deleteMe',
  authController.authenticate,
  userController.deleteMe,
);

router
  .route('/me')
  .get(
    authController.authenticate,
    userController.getMe,
    userController.getUser,
  );

router.route('/').get(userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.authenticate,
    authController.authorize('admin'),
    userController.deleteUser,
  );

module.exports = router;
