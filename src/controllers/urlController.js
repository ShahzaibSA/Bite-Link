const shortid = require('shortid');
const ip = require('ip');
const Url = require('../models/url');

const handleGenerateShortUrl = async function (req, res) {
  const body = req.body;
  if (!body.url) return res.status(400).send({ error: 'Please send valid Url!' });
  try {
    const id = shortid.generate();
    const result = await Url.create({
      shortId: id,
      redirectUrl: body.url,
      createdBy: req.user._id
    });
    // return res.render('index', {
    //   id: result.shortId
    // });
    return res.send({ id: result.shortId });
  } catch (error) {
    res.status(400).send({ error });
    // res.status(500).send(error);
  }
};

const handleRedirectUrl = async function (req, res) {
  const id = req.params.shortId;
  if (!id || !shortid.isValid(id)) return res.status(400).send({ error: 'Please send vaild id!' });

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

const handleGetAnalytics = async function (req, res) {
  const id = req.query.url ? req.query.url.split('/url/')[1] : '';
  console.log('ID =>', id);
  // console.log('req.user :>> ', req.user);
  if (!id) {
    return res.status(404).send({ error: 'Url is not valid!' });
  }

  try {
    const result = await Url.findOne({ shortId: id, createdBy: req.user._id });
    console.log('result :>> ', result);
    if (!result) return res.status(404).send({ error: 'Url is not correct!' });

    if (!result.visitHistory.length) return res.status(404).send({ error: 'No Data Found!' });

    var clickHistory = result.visitHistory.map((history) => {
      return {
        date: new Date(history.timestamp).toString().split('GMT')[0],
        ipAddress: history.ipAddress
      };
    });
    return res.send({
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
