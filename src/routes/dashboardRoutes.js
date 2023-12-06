const express = require('express');
const { verifyJWT, restrictToLoggedInUser } = require('../middlewares/auth');
const {
  handleDashboard,
  handleUrlsData,
  handleNotifications,
  handleProfile
} = require('../controllers/dashboardControllers');

const router = express.Router();

router.get('/', restrictToLoggedInUser, handleDashboard);

router.get('/links', restrictToLoggedInUser, handleUrlsData);

router.get('/notifications', restrictToLoggedInUser, handleNotifications);

router.get('/profile', restrictToLoggedInUser, handleProfile);

module.exports = router;
