import {
  KinesisStreamHandler,
  KinesisStreamRecordPayload,
} from 'aws-lambda';

const consumer: KinesisStreamHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const payload: KinesisStreamRecordPayload = record.kinesis;
      const message: string = Buffer.from(payload.data, 'base64').toString();

      console.log(
        `Kinesis Message:
          partition key: ${payload.partitionKey}
          sequence number: ${payload.sequenceNumber}
          kinesis schema version: ${payload.kinesisSchemaVersion}
          data: ${message}
        `);

      // Do something
    }
  } catch (error) {
    console.log(error);
  }
};

export default consumer;
