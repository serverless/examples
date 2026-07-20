import { APIGatewayProxyHandler } from 'aws-lambda';
import { KinesisClient, PutRecordCommand } from '@aws-sdk/client-kinesis';
import { randomUUID } from 'crypto';

const kinesis = new KinesisClient({});

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
    await kinesis.send(
      new PutRecordCommand({
        StreamName: streamName,
        PartitionKey: randomUUID(),
        Data: Buffer.from(event.body),
      }),
    );

    message = 'Message placed in the Event Stream!';

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

export default producer;
