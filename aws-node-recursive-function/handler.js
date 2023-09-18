const aws = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

// eslint-disable-next-line no-unused-vars
module.exports.recursiveLambda = (event, context, callback) => {
  const lambda = new aws.Lambda();
  console.log('received', event);
  /* if numberOfCalls still has value, continue recursive operation */
  if (event.numberOfCalls > 0) {
    console.log('recursive call');
    /* decrement numberOfCalls so we don't infinitely loop */
    event.numberOfCalls -= 1; // eslint-disable-line no-param-reassign
    const params = {
      FunctionName: context.functionName,
      InvocationType: 'Event',
      Payload: JSON.stringify(event),
      Qualifier: context.functionVersion,
    };
    lambda.invoke(params, context.done);
  } else {
    console.log('recursive call finished');
    context.succeed('finished');
  }
};
