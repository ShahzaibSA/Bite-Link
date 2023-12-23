const bcrypt = require('bcrypt');
const validator = require('validator');

const User = require('../models/user');
const Url = require('../models/url');
const generateToken = require('../utils/generateToken');
const { uploadImgToCloudinary, deleteImgFromCloudinary } = require('../services/cloudinary.service');
const sharp = require('sharp');
const { bufferToDataURI } = require('../utils/generateBase64Img');

const handleSignUpUser = async function (req, res) {
  try {
    const body = req.body;
    const hashedPwd = await bcrypt.hash(body.password, 10);
    await User.create({ ...body, password: hashedPwd });
    res.status(201).send({ redirectUrl: req.get('origin') + '/login' });
  } catch (error) {
    res.status(400).send(error);
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

    const accessToken = generateToken(user._id.toString(), 'AT', '10s');
    const jwt = generateToken(user._id.toString(), 'JWT', '1d');
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
    // req.user.refreshTokens = [];
    // await req.user.save();
    // res.clearCookie('jwt');
    // res.clearCookie('refreshToken');
    req.user.refreshTokens = req.user.refreshTokens.filter((rts) => rts.refreshToken === req.cookies.refreshToken);
    await req.user.save();
    res.send({ message: 'Successfully logout all other devices' });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleUpdateUser = async function (req, res) {
  try {
    const user = req.user;
    const body = req.body;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'fullName', 'email'];

    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    // const isValidUpdate = allowedUpdates.every((update) => updates.includes(update));

    if (!isValidUpdate) return res.status(400).send({ error: 'Invalid updates!' });

    updates.forEach((update) => (user[update] = body[update]));
    await user.save();

    res.send({
      fullName: user.fullName,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleDeleteUser = async function (req, res) {
  const { password } = req.body;
  if (!password) res.status(400).send({ error: 'Please provide password' });
  try {
    const user = await User.findOne({ _id: req.user._id });
    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(400).send({ error: 'Password is not correct!' });
    }
    if (user.avatar.public_id) await deleteImgFromCloudinary(user.avatar.public_id);
    await Url.deleteMany({ createdBy: user._id });
    await User.findOneAndDelete({ _id: user._id });
    res.clearCookie('jwt');
    res.clearCookie('refreshToken');
    res.send({ message: 'Account successfully deleted!', success: true });
  } catch (error) {
    res.status(500).send(error);
  }
};

// const uploadSingleImage = upload.single('avatar');
const handleUploadUserAvatar = async function (req, res) {
  // uploadSingleImage(req, res, function (err) {
  //   var errorMessage;
  //   if (err) {
  //     errorMessage = err;
  //   }
  //   if (errorMessage) {
  //     return res.status(400).send({ message: err.message });
  //   }
  //   res.send(req.file);
  // });
  try {
    const file = req.file;
    const user = req.user;
    if (!file) return res.status(400).send({ error: 'Image is required!' });

    const img = sharp(req.file.buffer).jpeg();
    const fileFormat = img.options.formatOut;
    const fileName = `avatar-${user._id}.${fileFormat}`;
    const public_id = `avatar-${user._id}`;
    const imgbuf = await img.toBuffer();
    const { base64 } = bufferToDataURI(fileFormat, imgbuf);
    const response = await uploadImgToCloudinary(base64, fileFormat, fileName, public_id);

    user.avatar.url = response.secure_url;
    user.avatar.public_id = response.public_id;
    await user.save();
    res.send({ imgUrl: response.secure_url });
    // const response = await uploadToCloudinary(req.file.path);
  } catch (error) {
    if (error.name === 'TimeoutError') return res.redirect('/profile');
    res.status(400).send({ error: 'Only image is allowed.' });
  }
};

const handleDeleteUserAvatar = async function (req, res) {
  try {
    const response = await deleteImgFromCloudinary(req.user.avatar.public_id);
    if (response.result === 'ok') {
      req.user.avatar.url = null;
      req.user.avatar.public_id = null;
      await req.user.save();
      res.send({ message: 'Profile picture deleted!' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  handleSignUpUser,
  handleloginUser,
  handlelogoutUser,
  handlelogoutAllUsers,
  handleDeleteUser,
  handleUpdateUser,
  handleUploadUserAvatar,
  handleDeleteUserAvatar
};
