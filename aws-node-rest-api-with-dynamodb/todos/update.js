import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const update = async (event) => {
  const data = JSON.parse(event.body ?? '{}');
  if (typeof data.text !== 'string' || typeof data.checked !== 'boolean') {
    return { statusCode: 400, body: JSON.stringify({ error: '"text" and "checked" must be provided' }) };
  }

  const result = await client.send(
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
