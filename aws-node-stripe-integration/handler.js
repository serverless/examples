'use strict';

module.exports.incoming = (event, context, callback) => {
  const stage =
    event.requestContext
    ? event.requestContext.stage
    : 'test';

  let ConfigFile = require('config');
	let async = require('async');

  let stripe_api_key    =
    stage == 'test'
    ? ConfigFile.stripe.test_sk
    : ConfigFile.stripe.live_sk;
  let stripe = require('stripe')(stripe_api_key);

  console.log('Event: %j', event);
  async.waterfall([
  function(nextProcess) {
    let stripe_event;
    try {
      stripe_event = JSON.parse(event.body); // https://stripe.com/docs/api#event_object
      console.log('Incoming Data: %j', stripe_event);
      nextProcess(null, stripe_event);
    } catch(err){
      nextProcess(err);
    }
  },
  function(stripe_event, nextProcess) {
    // Verify the event by fetching it from Stripe
    stripe.events.retrieve(stripe_event.id, nextProcess);
  },
  function(stripe_event, nextProcess) {
    // Branch by the event type
    let event_type = stripe_event.type ? stripe_event.type : '';
    console.log('Event: ' + event_type);

    switch(event_type) {
      case 'invoice.created':
        nextProcess(null, stripe_event);
        break;
      default:
        nextProcess(null, stripe_event);
        break;
    }
  }],
  function(err, result) {
    let response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Stripe webhook incoming!',
        stage: stage
      }),
    };
    if (err) console.log('Error: %j', err);
    callback(null, response);
  });
};
