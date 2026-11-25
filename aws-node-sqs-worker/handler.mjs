import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient();

// POST /jobs with a JSON object: puts it on the jobs queue and answers right
// away. The worker processes it later.
export const producer = async (event) => {
  let job;
  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    job = JSON.parse(body ?? '');
  } catch {
    // Not JSON: answered below.
  }
  if (job === null || typeof job !== 'object' || Array.isArray(job)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Send a JSON object as the body.' }) };
  }

  const { MessageId } = await sqs.send(new SendMessageCommand({ QueueUrl: process.env.QUEUE_URL, MessageBody: JSON.stringify(job) }));
  return { statusCode: 202, body: JSON.stringify({ messageId: MessageId }) };
};

// Invoked by Lambda with a batch of up to 10 messages from the queue. Returns
// the IDs of the messages it couldn't process, so only those are retried.
export const worker = async (event) => {
  const batchItemFailures = [];
  for (const record of event.Records) {
    try {
      const job = JSON.parse(record.body);
      if (typeof job.task !== 'string' || job.task.trim() === '') throw new Error('the job has no "task" string');
      console.log(`Processed job ${record.messageId}: ${job.task}`);
    } catch (err) {
      console.error(`Job ${record.messageId} failed on receive ${record.attributes.ApproximateReceiveCount}: ${err.message}`);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
};
