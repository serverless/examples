#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');

const awsAccessKeyId = '<your access key id>';
const awsSecretAccessKey = '<your secret access key>';
const bucketName = '<your bucket name>';

const msPerDay = 24 * 60 * 60 * 1000;
const expiration = new Date(Date.now() + msPerDay).toISOString();
const bucketUrl = `https://${bucketName}.s3.amazonaws.com`;

const policy = {
  expiration,
  conditions: [
    ['starts-with', '$key', 'uploads/'],
    { bucket: bucketName },
    { acl: 'public-read' },
    ['starts-with', '$Content-Type', 'image/png'],
    { success_action_status: '201' },
  ],
};

const policyB64 = Buffer(JSON.stringify(policy), 'utf-8').toString('base64');

const hmac = crypto.createHmac('sha1', awsSecretAccessKey);
hmac.update(new Buffer(policyB64, 'utf-8'));

const signature = hmac.digest('base64');

fs.readFile('frontend/index.template.html', 'utf8', (err, input) => {
  if (err) {
    console.log(err);
  }

  const data = input
    .replace(/%BUCKET_URL%/g, bucketUrl)
    .replace(/%AWS_ACCESS_KEY%/g, awsAccessKeyId)
    .replace(/%POLICY_BASE64%/g, policyB64)
    .replace(/%SIGNATURE%/g, signature);

  fs.writeFile('frontend/index.html', data, 'utf8', (e) => {
    if (e) {
      console.log(e);
    }
  });
});
