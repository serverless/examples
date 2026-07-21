import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const create = async (event) => {
  const data = JSON.parse(event.body ?? '{}');
  if (typeof data.text !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: '"text" must be a string' }) };
  }
  const timestamp = Date.now();
  const item = {
    id: randomUUID(),
    text: data.text,
    checked: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await client.send(new PutCommand({ TableName: process.env.DYNAMODB_TABLE, Item: item }));
  return { statusCode: 201, body: JSON.stringify(item) };
};
