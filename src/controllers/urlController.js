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
    const urlData = await Url.findOne({ shortId: id });
    if (!urlData.status) return res.render('linkOffline', { message: 'Link is offline.' });
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
  const { id } = req.query;
  const { _id: createdBy } = req.user;

  if (!id) {
    return res.status(404).send({ error: 'URL is not valid!' });
  }

  try {
    const result = await Url.findOne({ shortId: id, createdBy });
    if (!result) {
      return res.status(404).send({ error: 'URL is not correct!' });
    }

    if (!result.visitHistory.length) {
      return res.status(404).send({ error: 'No data found!' });
    }

    const clickHistory = result.visitHistory.map((history) => {
      const date = new Date(history.timestamp).toString().split('GMT')[0];
      const { ipAddress } = history;
      return { date, ipAddress };
    });

    return res.send({
      totalClicks: result.visitHistory.length,
      clickHistory,
      redirectUrl: result.redirectUrl,
      shortId: result.shortId
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleUpdateLink = async function name(req, res) {
  const updates = Object.keys(req.body).filter((key) => key !== 'shortId');
  const allowedUpdates = ['redirectUrl', 'status'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const result = await Url.findOne({ createdBy: req.user._id, shortId: req.body.shortId });
    if (!result) return res.status(404).send({ error: 'Link not found' });

    updates.forEach((update) => (result[update] = req.body[update]));
    await result.save();
    res.send({ status: result.status, redirectUrl: result.redirectUrl });
  } catch (error) {
    res.status(500).send(error);
  }
};

const handleDeleteLink = async function (req, res) {
  const { shortId } = req.body;
  if (!shortId) return res.status(404).send({ error: 'Please provide short id!' });
  try {
    const result = await Url.findOneAndDelete({ shortId, createdBy: req.user._id });
    if (!result) return res.status(404).send({ error: 'Link not found' });
    res.json({ message: 'Link Deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  handleGenerateShortUrl: handleGenerateShortUrl,
  handleUpdateLink: handleUpdateLink,
  handleDeleteLink: handleDeleteLink,
  handleRedirectUrl: handleRedirectUrl,
  handleGetAnalytics: handleGetAnalytics
};
