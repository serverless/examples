import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

export const mkgif = async (event) => {
  if (!event.Records) {
    console.log('not an s3 invocation!');
    return;
  }
  for (const record of event.Records) {
    if (!record.s3) {
      console.log('not an s3 invocation!');
      continue;
    }
    if (record.s3.object.key.endsWith('.gif')) {
      console.log('already a gif');
      continue;
    }
    // get the file
    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key,
      })
    );
    // write file to disk
    writeFileSync(`/tmp/${record.s3.object.key}`, await Body.transformToByteArray());
    // convert to gif!
    spawnSync(
      '/opt/ffmpeg/ffmpeg',
      ['-i', `/tmp/${record.s3.object.key}`, '-f', 'gif', `/tmp/${record.s3.object.key}.gif`],
      { stdio: 'inherit' }
    );
    // read gif from disk
    const gifFile = readFileSync(`/tmp/${record.s3.object.key}.gif`);
    // delete the temp files
    unlinkSync(`/tmp/${record.s3.object.key}.gif`);
    unlinkSync(`/tmp/${record.s3.object.key}`);
    // upload gif to s3
    await s3.send(
      new PutObjectCommand({
        Bucket: record.s3.bucket.name,
        Key: `${record.s3.object.key}.gif`,
        Body: gifFile,
      })
    );
  }
};
