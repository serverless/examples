'use strict';

// dependencies
// eslint-disable-next-line import/no-extraneous-dependencies
const AWS = require('aws-sdk');
const util = require('util');
const sharp = require('sharp');

const dstBucket = process.env.OUTPUT_BUCKET;

// get reference to S3 client
const s3 = new AWS.S3();

module.exports.shrinkToThumbnail = async (event) => {
  // Read options from the event parameter.
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 }),
  );
  const srcBucket = event.Records[0].s3.bucket.name;
  // Object key may have spaces or unicode non-ASCII characters.
  const srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' '),
  );

  // Infer the image type from the file suffix.
  const typeMatch = srcKey.match(/\.([^.]*)$/);
  if (!typeMatch) {
    console.log('Could not determine the image type.');
    return;
  }

  // Check that the image type is supported
  const imageType = typeMatch[1].toLowerCase();
  const extension = typeMatch[0];
  if (imageType !== 'jpg' && imageType !== 'png') {
    console.log(`Unsupported image type: ${imageType}`);
    return;
  }
  const dstKey = srcKey.replace(extension, `-thumb${extension}`);

  // Download the image from the S3 source bucket.
  let origimage;
  try {
    const params = {
      Bucket: srcBucket,
      Key: srcKey,
    };
    origimage = await s3.getObject(params).promise();
  } catch (error) {
    console.log(error);
    return;
  }

  // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const width = 200;

  // Use the sharp module to resize the image and save in a buffer.
  let buffer;
  try {
    buffer = await sharp(origimage.Body).resize(width).toBuffer();
  } catch (error) {
    console.log(error);
    return;
  }

  // Upload the thumbnail image to the destination bucket
  try {
    const destparams = {
      Bucket: dstBucket,
      Key: dstKey,
      Body: buffer,
      ContentType: 'image',
    };

    await s3.putObject(destparams).promise();
  } catch (error) {
    console.log(error);
    return;
  }

  console.log(
    `Successfully resized ${srcBucket}/${srcKey} and uploaded to ${dstBucket}/${dstKey}`,
  );
};
