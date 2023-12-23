const jwt = require('jsonwebtoken');
const User = require('../models/user');
const generateToken = require('../utils/generateToken');

const hanleRefreshToken = async function (req, res) {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(403).send({ error: 'NO_REFRESH_TOKEN' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'None', secure: true });

  try {
    const foundUser = await User.findOne({ 'refreshTokens.refreshToken': refreshToken });

    //! Reuse of Token;
    if (!foundUser) {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      if (!decoded) return res.status(403).send({ error: 'Something went wrong' });
      const hackedUser = await User.findOne({ _id: decoded.uid });
      hackedUser.refreshTokens = [];
      await hackedUser.save();
      res.clearCookie('jwt');
      return res.redirect('/login');
      // return res.status(403).send({ error: 'USED_TOKEN' });
    }

    const newRefreshTokensArr = foundUser.refreshTokens.filter((rts) => rts.refreshToken !== refreshToken);

    //! Evaluate jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, decoded) => {
      if (error) {
        foundUser.refreshTokens = [...newRefreshTokensArr];
        await foundUser.save();
        res.clearCookie('jwt');
        return res.status(403).send({ error: 'EXPIRED_TOKEN' });
      }
      if (decoded.uid !== foundUser._id.toString()) return res.status(403).send({ error: 'INVALID_TOKEN' });

      const newAccessToken = generateToken(foundUser._id.toString(), 'AT', '10s');
      const newRefreshToken = generateToken(decoded.uid, 'RT', '1d');

      foundUser.refreshTokens = [...newRefreshTokensArr, { refreshToken: newRefreshToken }];
      await foundUser.save();

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
      });
      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = hanleRefreshToken;
