'use strict';

// ES5
var FB = require('fb');

module.exports = function() {
    this.post = function(data, token, callback) {
      var options = FB.options({accessToken: token});
      var fb = new FB.Facebook(options);

      var parameters = {};
      if (data.hasOwnProperty("message")) {
        parameters.message = data.message;
      }
      if (data.hasOwnProperty("link")) {
        parameters.link = data.link;
      }

      FB.api('me/feed', 'post', parameters, function (res) {
        if(!res || res.error) {
          console.log(!res ? 'error occurred' : res.error);
          callback(res.error,null);
          return;
        }
        else {

        }
        callback(null,res.id);
      });
    };
};
