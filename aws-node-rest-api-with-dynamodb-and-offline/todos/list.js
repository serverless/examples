import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import dynamodb from './dynamodb.js';

export const list = async () => {
  const result = await dynamodb.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE }));
  return { statusCode: 200, body: JSON.stringify(result.Items) };
};
