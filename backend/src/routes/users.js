const express = require('express');
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  updateProfileRules,
  changePasswordRules,
  deleteAccountRules,
} = require('../validators/authValidators');

const router = express.Router();

// All endpoints in user profile module require authentication
router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', updateProfileRules, validate, userController.updateProfile);
router.patch('/me/password', changePasswordRules, validate, userController.changePassword);
router.delete('/me', deleteAccountRules, validate, userController.deleteAccount);

module.exports = router;
