import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const list = async () => {
  const result = await client.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE }));
  return { statusCode: 200, body: JSON.stringify(result.Items) };
};
