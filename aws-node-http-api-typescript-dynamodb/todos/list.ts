import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

const params = {
  TableName: process.env.DYNAMODB_TABLE,
};

export const list: APIGatewayProxyHandlerV2 = async () => {
  try {
    // fetch all todos from the database
    // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
    const result = await dynamoDb.send(new ScanCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: "Couldn't fetch the todo items.",
    };
  }
};
