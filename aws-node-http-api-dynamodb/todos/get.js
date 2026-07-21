import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const get = async (event) => {
  const result = await client.send(
    new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { id: event.pathParameters.id },
    })
  );
  if (!result.Item) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Todo not found' }) };
  }
  return { statusCode: 200, body: JSON.stringify(result.Item) };
};
