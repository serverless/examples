'use strict';

// ES5
const FB = require('fb');

module.exports = function () {
  this.post = function (data, token, callback) {
    FB.setAccessToken(token);

    const parameters = {};
    if (Object.prototype.hasOwnProperty.call(data, 'message')) {
      parameters.message = data.message;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'link')) {
      parameters.link = data.link;
    }

    FB.api('me/feed', 'post', parameters, (res) => {
      if (!res || res.error) {
        callback(res.error, null);
      } else {
        callback(null, res.id);
      }
    });
  };
};
