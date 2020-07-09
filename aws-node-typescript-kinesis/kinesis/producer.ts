import { APIGatewayProxyHandler } from 'aws-lambda';
import { Kinesis } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const kinesis = new Kinesis({
  apiVersion: '2013-12-02',
});

const producer: APIGatewayProxyHandler = async (event) => {
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

  const streamName: string = 'eventStream';

  try {
    await kinesis.putRecord({
      StreamName: streamName,
      PartitionKey: uuidv4(),
      Data: event.body,
    }).promise();

    message = 'Message placed in the Event Stream!';

  } catch (error) {
    console.log(error);
    message = error;
    statusCode = 500;
  }

  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

export default producer;
