import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

export const connect = async () => ({
  statusCode: 200,
  body: 'Connected.',
});

export const disconnect = async () => ({
  statusCode: 200,
  body: 'Disconnected.',
});

export const defaultHandler = async (event) => {
  // default function that just echos back the data to the client
  const client = new ApiGatewayManagementApiClient({
    endpoint: `https://${event.requestContext.domainName}/${event.requestContext.stage}`,
  });

  await client.send(
    new PostToConnectionCommand({
      ConnectionId: event.requestContext.connectionId,
      Data: `default route received: ${event.body}`,
    })
  );

  return {
    statusCode: 200,
    body: 'Sent.',
  };
};

export const auth = async (event) => {
  // return policy statement that allows to invoke the connect function.
  // in a real world application, you'd verify that the header in the event
  // object actually corresponds to a user, and return an appropriate statement accordingly
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn,
        },
      ],
    },
  };
};

export { defaultHandler as default };
