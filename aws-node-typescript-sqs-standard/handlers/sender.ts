import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { SQS } from "aws-sdk";

const sqs = new SQS();

export const handler: APIGatewayProxyHandler =
  async (): Promise<APIGatewayProxyResult> => {
    let statusCode: number = 200;
    const message = "Hello world";

    const queueUrl: string = process.env.QUEUE_URL;
    await sqs
      .sendMessage({
        QueueUrl: queueUrl,
        MessageBody: message,
        MessageAttributes: {
          AttributeNameHere: {
            StringValue: "Attribute Value Here",
            DataType: "String",
          },
        },
      })
      .promise();

    return {
      statusCode,
      body: JSON.stringify({
        message,
      }),
    };
  };
