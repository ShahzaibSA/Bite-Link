const express = require('express');
const { restrictToLoggedInUser } = require('../middlewares/auth');
const {
  handleGenerateShortUrl,
  handleRedirectUrl,
  handleGetAnalytics
} = require('../controllers/url');

const router = express.Router();

router.post('/', restrictToLoggedInUser, handleGenerateShortUrl);

router.get('/analytics', restrictToLoggedInUser, handleGetAnalytics);

router.get('/:shortId', handleRedirectUrl);

module.exports = router;
