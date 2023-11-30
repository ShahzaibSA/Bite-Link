const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
  const accessToken = authHeader.split(' ')[1];

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) return res.status(403).send({ error: 'EXPIRED_TOKEN' });
    try {
      const user = await User.findOne({ email: decoded.email });
      req.user = user;
      next();
    } catch (error) {
      res.status(500).send(error);
    }
  });
};

const restrictToLoggedInUser = async function (req, res, next) {
  const jwtToken = req.cookies?.jwt;

  if (!jwtToken) return res.redirect('/login');

  jwt.verify(jwtToken, process.env.JWT_TOKEN_SECRET, async (error, decoded) => {
    if (error) return res.redirect('/login');
    try {
      const user = await User.findOne({ email: decoded.email });
      req.user = user;
      next();
    } catch (error) {
      res.status(500).send(error);
    }
  });
  next();
};

module.exports = { verifyJWT, restrictToLoggedInUser };
