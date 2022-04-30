import {
  APIGatewayProxyResult,
  APIGatewayProxyEvent,
  Callback,
  Context,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent | { source: string },
  context: Context,
  callback: Callback
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = false;
  if ("source" in event && event.source === "serverless-plugin-warmup") {
    callback(null, "warmed Lambda");
  }

  // your business logic here

  return {
    statusCode: 200,
    body: "OK",
  };
};
