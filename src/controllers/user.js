const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');

const { setUser, deleteUser } = require('../utils/session');

const handleSignUpUser = async function (req, res) {
  try {
    await User.create(req.body);
    // res.render('login');
    res.status(201).send({ redirectUrl: req.get('origin') + '/login' });
  } catch (error) {
    res.status(403).send(error);
  }
};

const handleloginUser = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.status(400).send({ error: 'Enter a valid email!' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // return res
      //   .status(400)
      //   .render('login', { error: 'No Account Found. Please Sign Up!' });
      return res
        .status(400)
        .send({ error: 'No Account Found. Please Sign Up!' });
    }
    if (user.password !== password) {
      return res
        .status(400)
        .send({ error: 'Email or password is not correct!' });
    }
    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie('uid', sessionId);
    res.send({ redirectUrl: req.get('origin') });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handlelogoutUser = async function (req, res) {
  try {
    deleteUser(req.cookies.uid);
    res.clearCookie('uid');
    res.send({ redirectUrl: req.get('origin') + '/login' });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser
};
