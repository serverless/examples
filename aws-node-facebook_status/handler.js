'use strict';

const Facebook = require('./facebook.js');

module.exports.postFb = (event, context, callback) => {
  const facebook = new Facebook();
  facebook.post(event.data, event.accessToken, (error, statusId) => {
    if (error) {
      callback(event.data); // error, send back the event
    } else {
      callback(null, statusId);
    }
  });
};
