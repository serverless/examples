<!--
title: 'AWS Upload a file to S3 to trigger a Lambda function example in NodeJS'
description: 'This example shows how to upload a file to S3 using a HTML form, and have S3 trigger a lambda function.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/walgarch'
authorName: walgarch
authorAvatar: 'https://avatars1.githubusercontent.com/u/32451330?v=4&s=140'
-->
# Upload a file to S3 to trigger a lambda function

This example shows how to upload a file to S3 using a HTML form, and have S3
trigger a lambda function.

## Use-cases

- Postprocess files uploaded to an S3 bucket.

## Setup

- The upload bucket defaults to `upload-postprocess-<stage>-<account-id>`, which
  is unique to your AWS account and stage. To use a different name, set the
  `BUCKET` environment variable before deploying.
- Edit `generate-form.js` and fill in your `aws_access_key_id`,
  `aws_secret_access_key` and `bucket_name` (matching the bucket name above).
- Run `yarn install` to install crypto-js dependency for `generate-form.js`.
- Generate the HTML form:


```bash
yarn install
node generate-form.js
```

## Deploy

In order to deploy the example, simply run:

```bash
serverless deploy
```

The output should look similar to:

```
Deploying "upload-to-s3-and-postprocess" to stage "dev" (us-east-1)

✔ Service deployed to stack upload-to-s3-and-postprocess-dev (38s)

functions:
  postprocess: upload-to-s3-and-postprocess-dev-postprocess (1.1 kB)
```

## Usage

Open the generated `frontend/index.html` in your browser, or run:

```bash
xdg-open frontend/index.html
```

Select a PNG image smaller than 1Mb, and click "Upload File to S3".

You should get an XML response similar to:

```xml
<PostResponse>
  <Location>https://serverless-fetch-file-and-store-in-s3.s3.amazonaws.com/uploads%2Fimage.png</Location>
  <Bucket>serverless-fetch-file-and-store-in-s3</Bucket>
  <Key>uploads/image.png</Key>
  <ETag>"08c03c6a24e5058b9f3556981a23b1d7"</ETag>
</PostResponse>
```

After a while, the postprocess function gets triggered by an S3 event:

```bash
serverless logs --function postprocess
```

```
START RequestId: e2deccf2a0-11e6-b6e3fbcfad7d8c Version: $LATEST
2014 12:32:30.350 (+02:00)	e2deccf2a0-11e6-b6e3fbcfad7d8c	New .png object has been created: uploads/image.png (23975 bytes)
END RequestId: e2deccf2a0-11e6-b6e3fbcfad7d8c
REPORT RequestId: e2deccf2a0-11e6-b6e3fbcfad7d8c	Duration: 2.84 ms	Billed Duration: 100 msMemory Size: 1024 MB	Max Memory Used: 29 MB
```
