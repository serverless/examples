/* eslint-disable */
/* aws-sdk automatically included in lambda context */
const aws = require('aws-sdk');

module.exports.recursiveLambda = (event, context, callback) => {
  const lambda = new aws.Lambda();
  console.log('received', event);
  /* if numberOfCalls still has value, continue recursive operation */
  if (event.numberOfCalls > 0) {
    console.log('recursive call');
    /* decrement numberOfCalls so we don't infinitely loop */
    event.numberOfCalls = event.numberOfCalls - 1;
    const params = {
      FunctionName: context.functionName,
      InvocationType: 'Event',
      Payload: JSON.stringify(event),
      Qualifier: context.functionVersion
    };
    lambda.invoke(params, context.done);
  } else {
    console.log('recursive call finished');
    context.succeed('finished');
  }
};
