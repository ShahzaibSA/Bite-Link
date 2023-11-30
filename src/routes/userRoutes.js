const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser,
  handlelogoutAllUsers
} = require('../controllers/userController');
const router = express.Router();

router.post('/', handleSignUpUser);

router.post('/login', handleloginUser);

router.post('/logout', verifyJWT, handlelogoutUser);

router.post('/logoutAll', verifyJWT, handlelogoutAllUsers);

module.exports = router;
