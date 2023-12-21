const Url = require('../models/url');

const handleDashboard = async function (req, res) {
  try {
    const urls = await Url.find({ createdBy: req.user._id });
    var totalClicks = 0;
    var runningLinks = 0;
    const data = urls.map((url) => {
      totalClicks += url.visitHistory.length;
      if (url.status) runningLinks++;
      return {
        redirectUrl: url.redirectUrl,
        visitHistory: url.visitHistory,
        shortUrl: req.get('origin') + '/url/' + url.shortId
        // shortUrl: 'http://localhost:5000/url' + url.shortId,
      };
    });
    return res.render('dashboard', { data, totalClicks, runningLinks });
  } catch (error) {
    res.status(500).send({ error: 'Something went wrong!' });
  }
};

const handleUrlsData = async function (req, res) {
  try {
    const urls = await Url.find({ createdBy: req.user._id });
    const data = urls.map((url, i) => {
      var date = url.createdAt.toString().split(' ');
      date = date[0] + ' ' + date[1] + ' ' + date[2] + ' ' + date[3];
      return {
        createdAt: date,
        status: url.status,
        shortId: url.shortId,
        redirectUrl: url.redirectUrl,
        visitHistory: url.visitHistory
      };
    });
    res.render('links', { data });
  } catch (error) {
    res.status(500).send({ error: 'Something went wrong!' });
  }
};

const handleProfile = function (req, res) {
  var date = req.user.createdAt.toString().split(' ');
  date = date[0] + ' ' + date[1] + ' ' + date[2] + ' ' + date[3] + ' ' + date[4];
  req.user.joined = date;
  res.render('profile', { data: req.user });
  // try {
  //   res.render('profile');
  // } catch (error) {
  //   res.status(500).send({ error: 'Something went wrong!' });
  // }
};

const handleNotifications = function (req, res) {
  res.render('notifications');
};

module.exports = {
  handleUrlsData,
  handleDashboard,
  handleProfile,
  handleNotifications
};

// shortUrl: 'http://localhost:5000/url/' + url.shortId;
