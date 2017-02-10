'use strict';

const getForecast = require('./lib/forecast');
const sendEmail = require('./lib/email');

const latitude = process.env.LATITUDE;
const longitude = process.env.LONGITUDE;
const emailRecpient = process.env.RECIPIENT;
const emailSubject = 'Current Weather';

module.exports.run = (event, context, callback) => {
  getForecast(latitude, longitude)
    .then((forecast) => { // eslint-disable-line arrow-body-style
      return sendEmail(emailRecpient, emailSubject, forecast);
    })
    .then(() => {
      callback(null, { success: true });
    })
    .catch((error) => {
      callback(error, { success: false });
    });
};
