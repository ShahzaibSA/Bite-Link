const express = require('express');
const { verifyJWT } = require('../middlewares/auth');
const {
  handleGenerateShortUrl,
  handleRedirectUrl,
  handleGetAnalytics,
  handleUpdateLink,
  handleDeleteLink
} = require('../controllers/urlController');

const router = express.Router();

router.post('/', verifyJWT, handleGenerateShortUrl);

router.delete('/', verifyJWT, handleDeleteLink);

router.patch('/', verifyJWT, handleUpdateLink);

router.get('/analytics', verifyJWT, handleGetAnalytics);

//! FOR ALL USERS
router.get('/:shortId', handleRedirectUrl);

module.exports = router;
