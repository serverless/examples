#!/usr/bin/env node

const crypto = require('crypto-js');
const Hex = require('crypto-js/enc-hex');
const fs = require('fs');

// from: https://docs.aws.amazon.com/general/latest/gr/signature-v4-examples.html#signature-v4-examples-javascript
function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = crypto.HmacSHA256(dateStamp, `AWS4${key}`);
  const kRegion = crypto.HmacSHA256(regionName, kDate);
  const kService = crypto.HmacSHA256(serviceName, kRegion);
  const kSigning = crypto.HmacSHA256('aws4_request', kService);
  return kSigning;
}

const awsAccessKeyId = '<your access key id>';
const awsSecretAccessKey = '<your secret access key>';
const bucketName = '<your bucket name>';
const region = '<your region name>';

const msPerDay = 24 * 60 * 60 * 1000;
const expiration = new Date(Date.now() + msPerDay).toISOString();
const bucketUrl = `https://${bucketName}.s3.amazonaws.com`;
const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const credentials = `${awsAccessKeyId}/${date}/${region}/s3/aws4_request`;

// Sample policy and form: https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-post-example.html
const policy = {
  expiration,
  conditions: [
    { bucket: bucketName },
    ['starts-with', '$key', 'uploads/'],
    { acl: 'public-read' },
    ['starts-with', '$Content-Type', 'image/png'],
    // ['starts-with', '$success_action_redirect', ''],
    ['starts-with', '$success_action_status', ''],

    { 'x-amz-credential': credentials },
    { 'x-amz-algorithm': 'AWS4-HMAC-SHA256' },
    { 'x-amz-date': `${date}T000000Z` },
  ],
};

const policyB64 = Buffer.from(JSON.stringify(policy), 'utf-8').toString('base64');

const sigKey = getSignatureKey(awsSecretAccessKey, date, region, 's3');

const signature = Hex.stringify(crypto.HmacSHA256(policyB64, sigKey));

fs.readFile('frontend/index.template.html', 'utf8', (err, input) => {
  if (err) {
    console.log(err);
  }

  const data = input
    .replace(/%BUCKET_URL%/g, bucketUrl)
    .replace(/%POLICY_BASE64%/g, policyB64)
    .replace(/%CREDENTIAL%/g, credentials)
    .replace(/%DATE%/g, `${date}T000000Z`)
    .replace(/%SIGNATURE%/g, signature);

  fs.writeFile('frontend/index.html', data, 'utf8', (e) => {
    if (e) {
      console.log(e);
    }
  });
});
