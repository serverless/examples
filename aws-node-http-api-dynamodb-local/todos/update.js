import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import dynamodb from './dynamodb.js';

export const update = async (event) => {
  const data = JSON.parse(event.body ?? '{}');

  if (typeof data.text !== 'string' || typeof data.checked !== 'boolean') {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't update the todo item.",
    };
  }

  const result = await dynamodb.send(
    new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { id: event.pathParameters.id },
      ExpressionAttributeNames: { '#todo_text': 'text' },
      ExpressionAttributeValues: {
        ':text': data.text,
        ':checked': data.checked,
        ':updatedAt': Date.now(),
      },
      UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',
      ReturnValues: 'ALL_NEW',
    })
  );
  return { statusCode: 200, body: JSON.stringify(result.Attributes) };
};
