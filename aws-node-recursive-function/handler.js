import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambda = new LambdaClient({});

export const recursiveLambda = async (event, context) => {
  console.log('received', event);
  /* if numberOfCalls still has value, continue recursive operation */
  if (event.numberOfCalls > 0) {
    console.log('recursive call');
    /* decrement numberOfCalls so we don't infinitely loop */
    event.numberOfCalls -= 1;
    await lambda.send(
      new InvokeCommand({
        FunctionName: context.functionName,
        InvocationType: 'Event',
        Payload: JSON.stringify(event),
        Qualifier: context.functionVersion,
      })
    );
    return 'invoked next call';
  }

  console.log('recursive call finished');
  return 'finished';
};
