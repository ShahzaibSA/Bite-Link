const express = require('express');

const upload = require('../middlewares/upload');
const { verifyJWT } = require('../middlewares/auth');
const {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser,
  handlelogoutAllUsers,
  handleUpdateUser,
  handleDeleteUser,
  handleUploadUserAvatar,
  handleDeleteUserAvatar
} = require('../controllers/userController');

const router = express.Router();

//! Sign Up
router.post('/', handleSignUpUser);

//! Login
router.post('/login', handleloginUser);

//! Update User
router.patch('/', verifyJWT, handleUpdateUser);

//! Delete User
router.delete('/', verifyJWT, handleDeleteUser);

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
