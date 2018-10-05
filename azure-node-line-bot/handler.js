'use strict';

/* eslint-disable no-param-reassign */

const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

module.exports.hello = function (context, req) {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => context.res.json(result))
    .then(() => context.done())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
};

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}