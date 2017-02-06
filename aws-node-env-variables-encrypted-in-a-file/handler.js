'use strict';

module.exports.resetPassword = (event, context, callback) => {
  console.log('SESSION_KEY: ', process.env.SESSION_KEY);

  // Authenticate the user session

  console.log('EMAIL_SERVICE_API_KEY: ', process.env.EMAIL_SERVICE_API_KEY);

  // The email service api key would be used to send a reset password email.

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Password sent.',
    }),
  };

  callback(null, response);
};
