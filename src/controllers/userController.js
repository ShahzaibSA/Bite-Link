const bcrypt = require('bcrypt');
const validator = require('validator');

const User = require('../models/user');
const generateToken = require('../utils/generateToken');

const handleSignUpUser = async function (req, res) {
  try {
    const { email, password } = req.body;
    const hashedPwd = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPwd });
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
      return res.status(400).send({ error: 'No Account Found. Please Sign Up!' });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).send({ error: 'Email or Password is not correct!' });
    }
    const refreshTokenCookie = req.cookies?.refreshToken;
    let refreshTokenArr = refreshTokenCookie
      ? user.refreshTokens.filter((rt) => rt.refreshToken !== refreshTokenCookie)
      : user.refreshTokens;

    const accessToken = generateToken(user.email, 'AT', '6s');
    const jwt = generateToken(user.email, 'JWT', '1d');
    const newRefreshToken = generateToken(user._id.toString(), 'RT', '1d');

    user.refreshTokens = refreshTokenArr.concat({ refreshToken: newRefreshToken });
    await user.save();

    res.cookie('jwt', jwt, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000
    });
    res.send({ user, accessToken, redirectUrl: req.get('origin') });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handlelogoutUser = async function (req, res) {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter((rts) => rts.refreshToken !== req.cookies.refreshToken);
    await req.user.save();
    res.clearCookie('jwt');
    res.clearCookie('refreshToken');
    res.send({ redirectUrl: req.get('origin') + '/login' });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handlelogoutAllUsers = async function (req, res) {
  try {
    req.user.refreshTokens = [];
    await req.user.save();

    res.clearCookie('jwt');
    res.clearCookie('refreshToken');
    return res.redirect('/login');
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser,
  handlelogoutAllUsers
};
