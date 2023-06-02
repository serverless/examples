import { APIGatewayEvent } from 'aws-lambda';
import SQS from 'aws-sdk/clients/sqs';

export const isLocalHost = (event: APIGatewayEvent): boolean => {
  const isLocalHost = event.headers?.host?.includes('localhost');
  return isLocalHost ?? false;
};

export const generateSQSQueueUrlFromArn = (arn: string | undefined): string => {
  if (!arn) return '';
  const [_, __, ___, region, accountId, queueName] = arn.split(':');
  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`;
};

export const getOfflineSqsQueueUrl = (sqsQueueUrl: string) => {
  const url = new URL(sqsQueueUrl);
  return `${process.env.SQS_OFFLINE_ENDPOINT}${url.pathname}`;
};
