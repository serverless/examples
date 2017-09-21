'use strict';

module.exports.timestamp = (event, context, callback) => {
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
    body: parseInt(Date.now() / 1000, 10),
  };

  callback(null, response);
};
