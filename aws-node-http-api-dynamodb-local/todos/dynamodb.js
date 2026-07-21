import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let clientOptions = {};

// connect to local DB if running offline
if (process.env.IS_OFFLINE) {
  clientOptions = {
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'DEFAULT_ACCESS_KEY',
      secretAccessKey: 'DEFAULT_SECRET',
    },
  };
}

const client = DynamoDBDocumentClient.from(new DynamoDBClient(clientOptions));

export default client;
