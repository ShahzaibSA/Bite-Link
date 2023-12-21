const jwt = require('jsonwebtoken');

const generateToken = function (payload, type, expiresIn) {
  if (type === 'AT') return jwt.sign({ uid: payload }, process.env.ACCESS_TOKEN_SECRET, { expiresIn });

  if (type === 'JWT') return jwt.sign({ uid: payload }, process.env.JWT_TOKEN_SECRET, { expiresIn });

  if (type === 'RT') return jwt.sign({ uid: payload }, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
};

module.exports = generateToken;
