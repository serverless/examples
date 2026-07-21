import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});

export const producer = async (event) => {
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ error: 'request body required' }) };
  }
  await sqs.send(new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: event.body,
  }));
  return { statusCode: 202, body: JSON.stringify({ status: 'queued' }) };
};

export const consumer = async (event) => {
  for (const record of event.Records) {
    console.log('processing job', record.messageId, record.body);
  }
};
