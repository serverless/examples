import twilio from 'twilio';
import Messenger from './messenger.js';

export const sendText = async (event) => {
  const response = {
    headers: { 'Access-Control-Allow-Origin': '*' }, // CORS requirement
    statusCode: 200,
  };

  Object.assign(event, { from: process.env.TWILIO_PHONE_NUMBER });

  try {
    const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const messenger = new Messenger(twilioClient);
    const message = await messenger.send(event);
    // text message sent! ✅
    console.log(`message ${message.body}`);
    console.log(`date_created: ${message.date_created}`);
    response.body = JSON.stringify({
      message: 'Text message successfully sent!',
      data: message,
    });
  } catch (error) {
    response.statusCode = error.status || 400;
    response.body = JSON.stringify({
      message: error.message,
      error,
    });
  }

  return response;
};
