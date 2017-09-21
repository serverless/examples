'use strict';

const ConfigFile = require('config'); // eslint-disable-line

module.exports.incoming = (event, context, callback) => {
  const requestContextStage =
    event.requestContext
    ? event.requestContext.stage
    : 'test';
  const stripeApiKey =
    requestContextStage === 'test'
    ? ConfigFile.stripe.test_sk
    : ConfigFile.stripe.live_sk;
  const stripe = require('stripe')(stripeApiKey); // eslint-disable-line

  try {
    // Parse Stripe Event
    const jsonData = JSON.parse(event.body); // https://stripe.com/docs/api#event_object

    // Verify the event by fetching it from Stripe
    console.log("Stripe Event: %j", jsonData); // eslint-disable-line
    stripe.events.retrieve(jsonData.id, (err, stripeEvent) => {
      const eventType = stripeEvent.type ? stripeEvent.type : '';
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Stripe webhook incoming!',
          stage: requestContextStage,
        }),
      };
      console.log("Event Type: %j", eventType); // eslint-disable-line

      // Branch by event type
      switch (eventType) {
        case 'invoice.created':
          // invoice.created event
          break;
        default:
          break;
      }
      callback(null, response);
    });
  } catch (err) {
    callback(null, {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Internal server error',
    });
  }
};
