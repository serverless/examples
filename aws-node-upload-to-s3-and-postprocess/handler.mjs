import { createHash } from 'node:crypto';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client();
const OUTPUT_PREFIX = process.env.OUTPUT_PREFIX;

// Runs for every object created under uploads/. Reads the object and writes a
// summary of it to processed/<name>.json. The output prefix is outside the
// trigger's prefix, so writing it doesn't invoke this function again.
export const postprocess = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    // Keys arrive URL-encoded, with a space as "+".
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = Buffer.from(await object.Body.transformToByteArray());
    const text = body.toString('utf8');

    const summary = {
      source: key,
      bytes: body.length,
      lines: text === '' ? 0 : text.split('\n').length - (text.endsWith('\n') ? 1 : 0),
      words: text.split(/\s+/).filter(Boolean).length,
      sha256: createHash('sha256').update(body).digest('hex'),
      processedAt: new Date().toISOString(),
    };

    const outputKey = `${OUTPUT_PREFIX}${key.slice(key.indexOf('/') + 1)}.json`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: outputKey,
        Body: JSON.stringify(summary, null, 2),
        ContentType: 'application/json',
      }),
    );
    console.log(`Processed ${key} (${summary.bytes} bytes, ${summary.words} words) into ${outputKey}`);
  }
};
