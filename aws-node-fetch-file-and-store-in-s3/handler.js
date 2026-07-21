import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

export const save = async (event) => {
  const response = await fetch(event.image_url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${response.url}: ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return s3.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET,
      Key: event.key,
      Body: buffer,
    })
  );
};
