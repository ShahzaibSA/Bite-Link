require('../utils/passport');
const passport = require('passport');
const express = require('express');

const upload = require('../middlewares/upload');
const { verifyJWT, hasWelcomeToken } = require('../middlewares/auth');
const {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser,
  handlelogoutAllUsers,
  handleUpdateUser,
  handleDeleteUser,
  handleVerifyUser,
  handleUploadUserAvatar,
  handleDeleteUserAvatar,
  handleSuccessGoogleOAuth
} = require('../controllers/userController');

const router = express.Router();

//! Sign up or Login with GOOGLE OAUTH 2.0
router.get('/google-oauth', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/oauth/error' }),
  handleSuccessGoogleOAuth
);

//! Sign Up
router.post('/', handleSignUpUser);

//! Login
router.post('/login', handleloginUser);

//! Update User
router.patch('/', verifyJWT, handleUpdateUser);

//! Delete User
router.delete('/', verifyJWT, handleDeleteUser);

//! Verify User
router.post('/verify', hasWelcomeToken, handleVerifyUser);

//! Upload Avatar
// router.post('/me/avatar', verifyJWT, handleUserAvatar);
router.post('/me/avatar', verifyJWT, upload.single('avatar'), handleUploadUserAvatar);

//! Delete Avatar
router.delete('/me/avatar', verifyJWT, handleDeleteUserAvatar);

//! Logout User
router.post('/logout', verifyJWT, handlelogoutUser);

//! Logout All User
router.post('/logoutAll', verifyJWT, handlelogoutAllUsers);

module.exports = router;
