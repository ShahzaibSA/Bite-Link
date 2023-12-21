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

router.post('/', handleSignUpUser);

router.post('/login', handleloginUser);

router.patch('/', verifyJWT, handleUpdateUser);

router.delete('/', verifyJWT, handleDeleteUser);

// router.post('/me/avatar', verifyJWT, handleUserAvatar);
router.post('/me/avatar', verifyJWT, upload.single('avatar'), handleUploadUserAvatar);

router.delete('/me/avatar', verifyJWT, handleDeleteUserAvatar);

router.post('/logout', verifyJWT, handlelogoutUser);

router.post('/logoutAll', verifyJWT, handlelogoutAllUsers);

module.exports = router;
