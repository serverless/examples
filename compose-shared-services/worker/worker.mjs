// Drains the SQS queue. A real worker would process each job here; this
// example just logs it, which is enough to prove the queue is wired up.
export const handler = async (event) => {
  for (const record of event.Records) {
    console.log('processing job', record.messageId, record.body);
  }
};
