const express = require('express');
const { restrictToLoggedInUser } = require('../middlewares/auth');

const router = express.Router();

router.get('/signup', function (req, res) {
  res.render('signup');
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.get('/', restrictToLoggedInUser, function (req, res) {
  res.render('index');
});

router.get('/analytics', restrictToLoggedInUser, function (req, res) {
  res.render('analytics');
});

module.exports = router;
