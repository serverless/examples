'use strict';

const fs = require('fs');

module.exports.image = (event, context, callback) => {
  const imageContent = fs.readFileSync('./block.png');
  // const response = {
  //   body: imageContent.toString('base64'),
  //   isBase64Encoded: true,
  //   statusCode: 200,
  //   headers: {
  //     'Content-Type': 'image/png',
  //   },
  // };

  const response = imageContent.toString('base64');

  // callback is sending HTML back
  callback(null, response);
};
