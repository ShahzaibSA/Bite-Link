require('dotenv').config();
const nodemailer = require('nodemailer');
const welcomeHtml = require('./getWelcomeHtml');

const mailer = async (email, name, welcomeToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      tls: {
        rejectUnauthorized: false // Accept self-signed certificates
      },
      auth: {
        user: process.env.MAILER_EMAIL,
        pass: process.env.MAILER_EMAIL_PASS
      }
    });
    const mailOptions = {
      from: process.env.MAILER_EMAIL,
      to: email,
      subject: 'Welcome to BITE LINK',
      html: welcomeHtml(name, welcomeToken)
    };
    transporter.sendMail(mailOptions, function (error, success) {
      if (error) {
        console.log('Error in nodemailer ', error);
      } else {
        console.log('Mail Send Successfully ', success.response);
      }
    });
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
module.exports = mailer;
