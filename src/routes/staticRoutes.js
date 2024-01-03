const express = require('express');

const { restrictToLoggedInUser, hasWelcomeToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/users/oauth/error', function (req, res) {
  res.status(400).send({ error: 'GOOGLE OAUTH FAIL' });
});

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.get('/users/verify', hasWelcomeToken, function (req, res) {
  res.render('welcome');
});

router.get('/', restrictToLoggedInUser, function (req, res) {
  res.render('index');
});

router.get('/analytics', restrictToLoggedInUser, function (req, res) {
  res.render('analytics');
});

module.exports = router;
