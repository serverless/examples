import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const dynamoDb = DynamoDBDocumentClient.from(client);

export const create: APIGatewayProxyHandlerV2 = async (event) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body ?? '{}');

  if (typeof data.text !== 'string') {
    console.error('Validation Failed');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Couldn't create the todo item." }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: randomUUID(),
      text: data.text,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    // write the todo to the database
    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 501,
      body: JSON.stringify({ message: "Couldn't create the todo item." }),
    };
  }
};
