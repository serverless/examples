import { APIGatewayProxyHandler } from 'aws-lambda';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

const sender: APIGatewayProxyHandler = async (event, context) => {
  let statusCode: number = 200;
  let message: string;

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No body was found',
      }),
    };
  }

  const region = context.invokedFunctionArn.split(':')[3];
  const accountId = context.invokedFunctionArn.split(':')[4];
  const queueName: string = 'receiverQueue';

  const queueUrl: string = `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`

  try {
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: event.body,
        MessageAttributes: {
          AttributeNameHere: {
            StringValue: 'Attribute Value Here',
            DataType: 'String',
          },
        },
      }),
    );

    message = 'Message placed in the Queue!';

  } catch (error) {
    console.log(error);
    message = error instanceof Error ? error.message : String(error);
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

export default sender;
