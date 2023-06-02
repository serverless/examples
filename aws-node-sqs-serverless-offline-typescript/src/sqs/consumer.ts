import { SQSEvent } from 'aws-lambda';

export const handleConsume = async (event: SQSEvent) => {
  console.log('SQS Consumer Event Log:', JSON.stringify(event, null, 2));
};
