'use strict';

const { getDadJoke } = require('./helpers/jokes');
const { tweetJoke } = require('./helpers/twitter');

module.exports.bot = (event, context, callback) => {
  // Call jokes api to get a joke
  getDadJoke()
    // eslint-disable-next-line consistent-return
    .then((json) => {
      // Check for a successful response
      // Bail if not!
      if (json.status !== 200) {
        return callback(null, { statusCode: json.status, body: JSON.stringify({ error: 'Could not fetch a joke' }) });
      }

      // Get the joke text
      const { joke } = json;
      console.log(`JOKE API RESPONSE ==> ${joke}`);

      // Set up the twitter module
      // Tweet the joke
      tweetJoke(joke)
        .then((response) => {
          console.log(JSON.stringify(response));
          // eslint-disable-next-line max-len
          return callback(null, { statusCode: json.status, body: JSON.stringify({ message: response }) });
        })
        .catch((error) => {
          console.error(error);
          return callback(null, { statusCode: 500, body: JSON.stringify({ error }) });
        });
    })
    .catch((error) => {
      console.error(error);
      return callback(null, { statusCode: 500, body: JSON.stringify({ error }) });
    });
};
