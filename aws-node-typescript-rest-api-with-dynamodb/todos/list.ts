import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export const list: APIGatewayProxyHandler = async () => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
  };

  try {
    // fetch all todos from the database
    // For production workloads you should design your tables and indexes so that your applications can use Query instead of Scan.
    const result = await dynamoDb.send(new ScanCommand(params));

    // create a response
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
