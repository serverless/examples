import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough } from 'node:stream';

const S3 = new S3Client({ region: process.env.REGION || 'us-east-1' });

class S3Handler {
  constructor() {}

  async readStream({ Bucket, Key }) {
    const { Body } = await S3.send(new GetObjectCommand({ Bucket, Key }));
    // In the Lambda Node.js runtime, Body is already a Node.js Readable stream.
    return Body;
  }

  writeStream({ Bucket, Key }) {
    const passThrough = new PassThrough();
    const uploaded = new Upload({
      client: S3,
      params: {
        Bucket,
        Key,
        Body: passThrough,
        ContentType: 'image/png',
      },
    }).done();
    return { writeStream: passThrough, uploaded };
  }
}

export const s3Handler = new S3Handler();
