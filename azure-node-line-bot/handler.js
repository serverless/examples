'use strict';

/* eslint-disable no-param-reassign */

const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: 'CHANNEL_ACCESS_TOKEN',
  channelSecret: 'CHANNEL_SECRET',
};

const client = new line.Client(config);

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

module.exports.hello = (context, req) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => { context.res.json(result); })
    .then(() => context.done())
    .catch((err) => {
      console.error(err);
      context.res.status(500).end();
    });
};
