import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'node:crypto';
import dynamodb from './dynamodb.js';

export const create = async (event) => {
  const data = JSON.parse(event.body ?? '{}');
  if (typeof data.text !== 'string') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't create the todo item.",
    };
  }

  const timestamp = Date.now();
  const item = {
    id: randomUUID(),
    text: data.text,
    checked: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await dynamodb.send(new PutCommand({ TableName: process.env.DYNAMODB_TABLE, Item: item }));
  return { statusCode: 200, body: JSON.stringify(item) };
};
