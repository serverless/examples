import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { simpleParser } from 'mailparser';

const s3 = new S3Client({ region: process.env.AWS_REGION });

export const postprocess = async (event) => {
  // console.log('Received event:', JSON.stringify(event, null, 2));
  const record = event.Records[0];
  // Retrieve the email from your bucket
  const request = {
    Bucket: record.s3.bucket.name,
    Key: record.s3.object.key,
  };

  try {
    const data = await s3.send(new GetObjectCommand(request));
    const rawEmail = await data.Body.transformToString();
    const email = await simpleParser(rawEmail);
    console.log('date:', email.date);
    console.log('subject:', email.subject);
    console.log('body:', email.text);
    console.log('from:', email.from.text);
    console.log('attachments:', email.attachments);
    return { status: 'success' };
  } catch (error) {
    console.log(error, error.stack);
    return error;
  }
};
