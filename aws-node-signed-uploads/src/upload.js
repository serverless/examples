import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const handler = async (event) => {
  const { REGION: region, BUCKET: bucket } = process.env;

  if (!region || !bucket) {
    throw new Error('REGION and BUCKET environment variables are required!');
  }

  const s3 = new S3Client({ region });

  const file =
    event.headers && event.headers['x-amz-meta-filekey']
      ? event.headers['x-amz-meta-filekey']
      : undefined;

  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing x-amz-meta-filekey in the header of the request.',
      }),
    };
  }

  const command = new PutObjectCommand({ Bucket: bucket, Key: file });

  try {
    const url = await getSignedUrl(s3, command, { expiresIn: 30 });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true, // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(url),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

export default handler;
