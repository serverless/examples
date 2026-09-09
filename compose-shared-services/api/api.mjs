import { randomUUID } from 'node:crypto';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const dynamodb = new DynamoDBClient({});
const sqs = new SQSClient({});

const TABLE_NAME = process.env.TABLE_NAME;
const JOBS_QUEUE_URL = process.env.JOBS_QUEUE_URL;

// POST /orders
// Writes an order to the shared table (resolved from the data stage) and
// enqueues a job on the same-stage worker queue. The response echoes the two
// resolved values so you can see exactly what Compose wired in.
export const handler = async (event) => {
  const orderId = randomUUID();
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : event.body;
  const body = rawBody ? JSON.parse(rawBody) : {};

  await dynamodb.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        orderId: { S: orderId },
        item: { S: String(body.item ?? 'unspecified') },
        createdAt: { S: new Date().toISOString() },
      },
    })
  );

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: JOBS_QUEUE_URL,
      MessageBody: JSON.stringify({ orderId }),
    })
  );

  return {
    statusCode: 201,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      orderId,
      status: 'created',
      wroteToTable: TABLE_NAME,
      enqueuedTo: JOBS_QUEUE_URL,
    }),
  };
};
