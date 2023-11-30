const express = require('express');
const hanleRefreshToken = require('../controllers/refreshTokenControllers');

const router = express.Router();

router.post('/', hanleRefreshToken);

module.exports = router;
