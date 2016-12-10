const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = require('twilio')(twilioAccountSid, twilioAuthToken);

module.exports.sendText = (event, context, callback) => {
  // use twilio SDK to send text message
  const sms = {
    to: event.to,
    body: event.message || '',
    from: twilioPhoneNumber,
  };
  // add image to sms if supplied
  if (event.image) {
    sms.mediaUrl = event.image;
  }
  twilioClient.messages.create(sms, (error, data) => { // eslint-disable-line
    if (error) {
      const errResponse = {
        headers: {
          "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
        },
        statusCode: error.status,
        message: error.message,
        error: JSON.stringify(error),
      };
      return callback(null, errResponse);
    }
    // text message sent! ✅
    console.log(`message: ${data.body}`);
    console.log(`date_created: ${data.date_created}`);

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*" // Required for CORS support to work
      },
      body: JSON.stringify({
        message: data,
      }),
    };

    callback(null, response);
  });
};
