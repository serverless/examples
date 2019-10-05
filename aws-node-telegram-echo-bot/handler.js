'use strict';

const request = require('request');

module.exports.webhook = (event, context, callback) => {
  const token = '[YOU TOKEN PLZ]';
  const BASE_URL = `https://api.telegram.org/bot${token}/sendMessage`;

  const body = JSON.parse(event.body)
  const message = body.message
  const chatId = message.chat.id
  
  request.post(BASE_URL).form({ text: message.text, chat_id: chatId });

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      input: event,
    }),
  };

  return callback(null, response);

};

