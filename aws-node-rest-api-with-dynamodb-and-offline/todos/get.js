import { GetCommand } from '@aws-sdk/lib-dynamodb';
import dynamodb from './dynamodb.js';

export const get = async (event) => {
  const result = await dynamodb.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { id: event.pathParameters.id },
    })
  );
  return { statusCode: 200, body: JSON.stringify(result.Item) };
};
