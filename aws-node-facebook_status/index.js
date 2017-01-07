'use strict';

var Facebook = require('./facebook.js');

/*
Example test event
{
  "accessToken": "dsadsadasdasd12jkhb1iu2b3hiu3h12ib3xh12bhj3zb2u1",
  "data": {
        "id" : "1234",
        "link": "www.google.ro",
        "message": "test"
    }
}
*/

exports.handler = (event, context, callback) => {
  var facebook = new Facebook();
  facebook.post(event.data, event.accessToken, function (error, status_id) {
    if (error) {
      callback(event.data); //error, send back the event
    }
    else {
      callback(null,status_id);
    }
  });
};
