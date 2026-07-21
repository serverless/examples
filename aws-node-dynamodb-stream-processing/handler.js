import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const s3 = new S3Client({ region: 'ap-southeast-1' });

export const processStream = async (event) => {
  const records = event.Records;

  const results = await Promise.all(
    records.map(async (record) => {
      const keysList = Object.values(unmarshall(record.dynamodb.Keys));
      const keysString = keysList.join('/');
      // NewImage is absent on REMOVE events, so a deletion produces an empty file
      const image = record.dynamodb.NewImage ? unmarshall(record.dynamodb.NewImage) : undefined;

      try {
        const response = await s3.send(
          new PutObjectCommand({
            Bucket: process.env.BUCKET,
            Key: `${process.env.PREFIX}/${process.env.TABLE}/${keysString}/image.json`,
            Body: JSON.stringify(image),
          })
        );
        console.log(`${keysString} record archived`, response);
        return response;
      } catch (err) {
        console.error('Error', err);
        return err;
      }
    })
  );

  return results;
};
