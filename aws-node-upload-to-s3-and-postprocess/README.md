<!--
title: AWS Upload a file to S3 to trigger a Lambda function example in NodeJS
description: This example shows how to upload a file to S3 using a HTML form, and have S3 trigger a lambda function.
layout: Doc
-->
# Upload a file to S3 to trigger a lambda function

This example shows how to upload a file to S3 using a HTML form, and have S3
trigger a lambda function.

## Use-cases

- Postprocess files uploaded to an S3 bucket.

## Setup

- Edit `serverless.yml` and choose a unique S3 bucket name.
- Edit `generate-form.js` and fill in your `aws_access_key_id`,
  `aws_secret_access_key` and `bucket_name`.
- Generate the HTML form:


```bash
node generate-form.js
```

## Deploy

In order to deploy the example, simply run:

```bash
serverless deploy
```

The output should look similar to:

```bash
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (3.85 MB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
........................
Serverless: Stack update finished...
Service Information
service: upload-to-s3-and-postprocess
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  upload-to-s3-and-postprocess-dev-postprocess

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

After a while, the postprocess function gets triggerd by an S3 event:

```bash
serverless logs --function postprocess
```

```
START RequestId: e2decc94-f2a0-11e6-b641-e3fbcfad7d8c Version: $LATEST
2017-02-14 12:32:30.350 (+02:00)	e2decc94-f2a0-11e6-b641-e3fbcfad7d8c	New .png object has been created: uploads/image.png (23975 bytes)
END RequestId: e2decc94-f2a0-11e6-b641-e3fbcfad7d8c
REPORT RequestId: e2decc94-f2a0-11e6-b641-e3fbcfad7d8c	Duration: 2.84 ms	Billed Duration: 100 msMemory Size: 1024 MB	Max Memory Used: 29 MB
```
