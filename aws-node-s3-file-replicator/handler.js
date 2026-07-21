import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});
const outputBucket = process.env.OUTPUT_BUCKET;

export const replicate = async (event) => {
  // Fail on missing data
  if (!outputBucket) {
    throw new Error('Error: Environment variable OUTPUT_BUCKET missing');
  }
  if (event.Records === null) {
    throw new Error('Error: Event has no records.');
  }

  await Promise.all(event.Records.map((record) => replicateObject(record, outputBucket)));
};

async function replicateObject(record, destBucket) {
  // The source bucket and source key are part of the event data
  const srcBucket = record.s3.bucket.name;
  const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  // Modify destKey if an alternate copy location is preferred
  const destKey = srcKey;
  const msg = `copying ${srcBucket}:${srcKey} to ${destBucket}:${destKey}`;

  console.log(`Attempting: ${msg}`);
  try {
    await s3.send(
      new CopyObjectCommand({
        Bucket: destBucket,
        Key: destKey,
        CopySource: encodeURIComponent(`${srcBucket}/${srcKey}`),
        MetadataDirective: 'COPY',
      })
    );
    console.log(`Success: ${msg}`);
  } catch (err) {
    console.log(`Error: ${msg}`, err);
    throw err;
  }
}
