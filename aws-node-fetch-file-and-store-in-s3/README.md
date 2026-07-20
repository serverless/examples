<!--
title: 'AWS Fetch image from URL and upload to S3 example in NodeJS'
description: 'This example display how to fetch an image from remote source (URL) and then upload this image to a S3 bucket.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/ScottBrenner'
authorName: 'Scott Brenner'
authorAvatar: 'https://avatars2.githubusercontent.com/u/416477?v=4&s=140'
-->
# Fetch image from URL then upload to s3 Example

This example display how to fetch an image from remote source (URL) and then upload this image to a S3 bucket.

## Use-cases

- Store a user's profile picture from another service.

## How it works

We first fetch the data from the given URL and then call the S3 `PutObjectCommand` to upload it to the bucket.

```js
const response = await fetch(event.image_url);
const buffer = Buffer.from(await response.arrayBuffer());
await s3.send(new PutObjectCommand({ Bucket, Key, Body: buffer }));
```

## Setup

Install the dependencies by running:

```bash
npm install
```

The S3 bucket used to store the files is created for you as part of this stack, with a CloudFormation-generated, globally-unique name — no manual setup is required.

```yml
resources:
  Resources:
    UploadBucket:
      Type: AWS::S3::Bucket
```

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Deploying "fetch-file-and-store-in-s3" to stage "dev" (us-west-1)

✔ Service deployed to stack fetch-file-and-store-in-s3-dev (42s)

functions:
  save: fetch-file-and-store-in-s3-dev-save (1.2 kB)
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
