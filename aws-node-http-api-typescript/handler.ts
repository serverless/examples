import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const hello: APIGatewayProxyHandlerV2 = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v4! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};
