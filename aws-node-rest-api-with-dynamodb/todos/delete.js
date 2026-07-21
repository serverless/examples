import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// `delete` is a reserved word, so the handler function is declared as `del`
// and re-exported under the `delete` name for the serverless.yml handler reference.
const del = async (event) => {
  await client.send(
    new DeleteCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { id: event.pathParameters.id },
    })
  );
  return { statusCode: 200, body: JSON.stringify({}) };
};

export { del as delete };
