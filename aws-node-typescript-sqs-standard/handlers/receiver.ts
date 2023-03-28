import { SQSEvent, SQSHandler, SQSMessageAttributes } from "aws-lambda";

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const messageAttributes: SQSMessageAttributes = record.messageAttributes;
    console.log(
      "Message Attributtes -->  ",
      messageAttributes.AttributeNameHere.stringValue
    );
    console.log("Message Body -->  ", record.body);
    // Do something
  }
};
