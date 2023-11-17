const express = require('express');
const { restrictToLoggedInUser } = require('../middlewares/auth');
const {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser
} = require('../controllers/user');
const router = express.Router();

router.post('/', handleSignUpUser);

router.post('/login', handleloginUser);

router.post('/logout', restrictToLoggedInUser, handlelogoutUser);

module.exports = router;
