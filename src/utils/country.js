const request = require('postman-request');

const getCountry = function () {
  const url = 'https://api.geoapify.com/v1/ipinfo?apiKey=1a4b6df0847e460b886172b3971eb66d';
  return new Promise((resolve, reject) => {
    request({ url, json: true }, (error, { body } = {}) => {
      if (body.city?.name && body.country?.name) {
        return resolve(body.city.name + ', ' + body.country.name);
      } else {
        return reject(null);
      }
    });
  });
};

module.exports = getCountry;
