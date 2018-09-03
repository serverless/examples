'use strict';

const request = require('request');

module.exports = (context, req) => {
  const token = 'YOUR_API_TOKEN';
  const BASE_URL = `https://api.telegram.org/bot${token}/sendMessage`;

  const chatId = req.body.message.chat.id;

  request.post(BASE_URL).form({ text: 'Hello World!', chat_id: chatId });

  const res = {
    // status: 200, /* Defaults to 200 */
    body: 'ok',
  };
  context.done(null, res);
};
