const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const tweetJoke = joke => new Promise((resolve, reject) => {
  client.post('statuses/update', { status: joke })
            .then(tweet => resolve(tweet))
            .catch(error => reject(error));
});

module.exports = {
  tweetJoke,
};
