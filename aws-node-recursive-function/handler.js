const aws = require('aws-sdk');

module.exports.recursiveLambda = (event, context, callback) => {
  const lambda = new aws.Lambda();
  console.log('received', event); // eslint-disable-line no-console
  if (event.numberOfCalls > 0) {
    console.log('recursive call'); // eslint-disable-line no-console
    event.numberOfCalls = event.numberOfCalls - 1;
    const params = {
      FunctionName: context.functionName,
      InvocationType: 'Event',
      Payload: JSON.stringify(event),
      Qualifier: context.functionVersion
    };
    lambda.invoke(params, context.done);
  } else {
    console.log('recursive call finished') // eslint-disable-line no-console
    context.succeed('finished');
  }
};