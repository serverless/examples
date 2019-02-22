import AWS from 'aws-sdk'; // eslint-disable-line import/no-extraneous-dependencies

export const handler = async event => {
  const { REGION: region, BUCKET: bucket } = process.env;

  if (!region || !bucket) {
    throw new Error('REGION and BUCKET environment variables are required!');
  }

  const S3 = new AWS.S3({ signatureVersion: 'v4', region });

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

  const params = {
    Bucket: bucket,
    Key: file,
    Expires: 30,
  };

  try {
    const url = await S3.getSignedUrl('putObject', params);

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
      body: JSON.stringify(error),
    };
  }
};

export default handler;
