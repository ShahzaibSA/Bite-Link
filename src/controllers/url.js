const shortid = require('shortid');
const ip = require('ip');
const Url = require('../models/url');

const handleGenerateShortUrl = async function (req, res) {
  const body = req.body;
  if (!body) return res.status(400).send({ error: 'Please send valid Url!' });
  try {
    const id = shortid.generate();
    const result = await Url.create({ shortId: id, redirectUrl: body.url });
    return res.render('index', {
      id: result.shortId
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleRedirectUrl = async function (req, res) {
  const id = req.params.shortId;
  if (!id || !shortid.isValid(id))
    return res.status(400).send({ error: 'Please send vaild id!' });

  try {
    const result = await Url.findOneAndUpdate(
      { shortId: id },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
            ipAddress: ip.address()
          }
        }
      }
    );
    if (!result) return res.status(404).send({ error: 'No Result Found!' });
    res.redirect(result.redirectUrl);
  } catch (error) {
    res.status(500).send(error);
  }
};

// const handleGetAnalytics = async function (req, res) {
//   const id = req.params.shortId;
//   if (!id || !shortid.isValid(id))
//     return res.status(400).send({ error: 'Please send vaild id!' });

//   try {
//     const result = await Url.findOne({ shortId: id });
//     if (!result) return res.status(404).send({ error: 'No Result Found!' });

//     var clickHistory = result.visitHistory.map((history) => {
//       return {
//         date: new Date(history.timestamp),
//         ipAddress: history.ipAddress
//       };
//     });
//     res.send({
//       totalClicks: result.visitHistory.length,
//       clickHistory: clickHistory
//     });
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

const handleGetAnalytics = async function (req, res) {
  const id = req.query.url ? req.query.url.split('/url/')[1] : '';

  if (!id || !shortid.isValid(id)) {
    return res.render('analytics');
  }

  try {
    const result = await Url.findOne({ shortId: id });
    if (!result) return res.status(404).send({ error: 'Url is not valid!' });

    var clickHistory = result.visitHistory.map((history) => {
      return {
        date: new Date(history.timestamp).toString().split('GMT')[0],
        ipAddress: history.ipAddress
      };
    });
    return res.render('analytics', {
      totalClicks: result.visitHistory.length,
      clickHistory: clickHistory,
      redirectUrl: result.redirectUrl,
      shortId: result.shortId
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  handleGenerateShortUrl: handleGenerateShortUrl,
  handleRedirectUrl: handleRedirectUrl,
  handleGetAnalytics: handleGetAnalytics
};
