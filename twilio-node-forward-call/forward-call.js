exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.VoiceResponse()
  twiml.dial(context.MY_PHONE_NUMBER);
  callback(null, twiml);
};