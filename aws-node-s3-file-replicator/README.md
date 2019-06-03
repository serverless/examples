<!--
title: 'AWS Fetch image from URL and upload to S3 example in NodeJS'
description: 'This example display how to fetch an image from remote source (URL) and then upload this image to a S3 bucket.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/ScottBrenner'
authorName: 'Scott Brenner'
authorAvatar: 'https://avatars2.githubusercontent.com/u/416477?v=4&s=140'
-->
# Fetch image from URL then upload to s3 Example

This example display how to fetch an image from remote source (URL) and then upload this image to a S3 bucket.

## Use-cases

- Store a user's profile picture from another service.

## How it works

We first fetch the data from given url and then call the S3 API `putObject` to upload it to the bucket.

```js
fetch('image URL')
  .then(res => {
    return s3.putObject({Bucket, Key, Body: res.body}).promise();
  }).then(res => {
    callback(null, res);
  }).catch(err => {
    callback(err, null);
  });
```

## Setup

Since this plugin uses the Serverless plugin `serverless-secrets-plugin` you need to setup the `node_modules` by running:

```bash
npm install
```

In addition you need to create an S3 bucket you want to store the files in. After you created the bucket change the bucket name in `serverless.yml` custom settings to your buckets.

```yml
custom:
  bucket: <your-bucket-name>
```

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (1.8 KB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
................
Serverless: Stack update finished...

Service Information
service: aws-node-fetch-file-and-store-in-s3
stage: dev
region: us-west-1
api keys:
  None
endpoints:
  None
functions:
  aws-node-fetch-file-and-store-in-s3-dev-save: arn:aws:lambda:us-west-1:377024778620:function:aws-node-fetch-file-and-store-in-s3-dev-save
```

## Usage

You can now send an HTTP request directly to the endpoint using a tool like curl

```bash
serverless invoke --function save --log --data='{ "image_url": "https://assets-cdn.github.com/images/modules/open_graph/github-mark.png", "key": "github.png"}'
```

The expected result should be similar to:

```bash
"Saved"
--------------------------------------------------------------------
START RequestId: c658859d-bd11e6-ac1f-c7a7ee5bd7f3 Version: $LATEST
END RequestId: c658859d-bd11e6-ac1f-c7a7ee5bd7f3
REPORT RequestId: c658859d-bd11e6-ac1f-c7a7ee5bd7f3	Duration: 436.94 ms	Billed Duration: 500 ms 	Memory Size: 1024 MB	Max Memory Used: 29 MB
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
