import Stripe from 'stripe';

export const incoming = async (event) => {
  const requestContextStage = event.requestContext ? event.requestContext.stage : 'test';
  const stripeApiKey =
    requestContextStage === 'test' ? process.env.STRIPE_TEST_SECRET_KEY : process.env.STRIPE_LIVE_SECRET_KEY;
  const stripe = new Stripe(stripeApiKey);

  try {
    // Parse Stripe Event
    const jsonData = JSON.parse(event.body); // https://stripe.com/docs/api#event_object

    // Verify the event by fetching it from Stripe
    console.log('Stripe Event: %j', jsonData);
    const stripeEvent = await stripe.events.retrieve(jsonData.id);
    const eventType = stripeEvent.type ?? '';
    console.log('Event Type: %j', eventType);

    // Branch by event type
    switch (eventType) {
      case 'invoice.created':
        // invoice.created event
        break;
      default:
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Stripe webhook incoming!',
        stage: requestContextStage,
      }),
    };
  } catch (err) {
    return {
      statusCode: err.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: err.message || 'Internal server error',
    };
  }
};
