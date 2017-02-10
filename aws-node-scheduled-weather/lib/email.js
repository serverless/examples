'use strict';

const Postmark = require('postmark');

const client = new Postmark.Client(process.env.POSTMARK_API_KEY);

module.exports = (to, subject, body) => {
  const options = {
    From: process.env.POSTMARK_SENDER,
    To: to,
    Subject: subject,
    TextBody: JSON.stringify(body),
  };

  return new Promise((resolve, reject) => {
    client.sendEmail(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};
