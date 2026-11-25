<!--
title: 'AWS Upload a file to S3 to trigger a Lambda function example in NodeJS'
description: 'This example shows how an upload to an Amazon S3 bucket triggers a Lambda function that reads the new object and writes a result back to the bucket.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/walgarch'
authorName: 'walgarch'
authorAvatar: 'https://avatars1.githubusercontent.com/u/32451330?v=4&s=140'
-->

# Process files uploaded to Amazon S3

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-upload-to-s3-and-postprocess.svg)](https://github.com/serverless/examples/blob/verified/results.json)

An upload to an Amazon S3 bucket can start your code: S3 sends an event notification for each new object, and the [`s3` event](https://www.serverless.com/framework/docs/providers/aws/events/s3) of the Serverless Framework creates the bucket, the notification and the permission that lets S3 invoke your function. This example creates a bucket, invokes a Node.js function for every file uploaded under `uploads/`, and has the function read the file and write a summary of it under `processed/` in the same bucket.

## What it deploys

- An S3 bucket named `upload-postprocess-<stage>-<account ID>`, with an event notification for objects created under `uploads/`.
- A Lambda function, `postprocess`, with an IAM role that can read objects under `uploads/` and write objects under `processed/` in that bucket, and a CloudWatch Logs log group.
- A stack output, `UploadBucketName`, with the bucket's name.

## Prerequisites

- The Serverless Framework CLI: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), to upload a file and read the result. The commands in Try it are written for Bash.

## Deploy

Deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "s3-postprocess" to stage "dev" (us-east-1)
✔ Service deployed to stack s3-postprocess-dev (56s)
functions:
  postprocess: s3-postprocess-dev-postprocess (6.6 kB)
```

## Try it

Print the stack's outputs:

```bash
serverless info --verbose
```

The line you need is this one:

```text
Stack Outputs:
  UploadBucketName: upload-postprocess-dev-123456789012
```

Copy its value into a shell variable:

```bash
BUCKET=upload-postprocess-dev-123456789012
```

Upload a text file under `uploads/`:

```bash
printf 'The quick brown fox\njumps over the lazy dog.\n' > notes.txt
aws s3 cp notes.txt "s3://$BUCKET/uploads/notes.txt"
```

S3 invokes the function a moment later. Read the summary it wrote to `processed/notes.txt.json`:

```bash
aws s3 cp "s3://$BUCKET/processed/notes.txt.json" -
```

```json
{
  "source": "uploads/notes.txt",
  "bytes": 45,
  "lines": 2,
  "words": 9,
  "sha256": "26e3df02e41ff53b6b16484bbdc2abe316d660fde0d09df8436ce4248ee27ab5",
  "processedAt": "2026-11-25T20:16:19.406Z"
}
```

If the command answers `The specified key does not exist`, wait a few seconds and run it again. The function's log shows each file it processed:

```bash
serverless logs --function postprocess
```

```text
INFO	Processed uploads/notes.txt (45 bytes, 9 words) into processed/notes.txt.json
```

## How it works

The `s3` event in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-upload-to-s3-and-postprocess/serverless.yml) names a bucket the stack doesn't have yet, so the Framework creates it with the notification configuration, and adds the permission that lets S3 invoke the function:

```yaml
custom:
  bucket: upload-postprocess-${sls:stage}-${aws:accountId}

functions:
  postprocess:
    handler: handler.postprocess
    environment:
      OUTPUT_PREFIX: processed/
    events:
      - s3:
          bucket: ${self:custom.bucket}
          event: s3:ObjectCreated:*
          rules:
            - prefix: uploads/
```

Bucket names are unique across all AWS accounts, so the name includes the stage and the account ID; two stages, or two readers of this example, get two buckets. The `prefix` rule limits the notification to keys under `uploads/`. The function writes its results under `processed/`, which the rule doesn't match, so its own writes don't invoke it again. Without the rule, every result would start another invocation.

S3 invokes the function asynchronously, with one or more records per event. [`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-upload-to-s3-and-postprocess/handler.mjs) decodes each record's key, which arrives URL-encoded, reads the object with the AWS SDK for JavaScript v3 that the Node.js runtime includes, and writes the summary:

```javascript
const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
// ...
await s3.send(new PutObjectCommand({ Bucket: bucket, Key: outputKey, Body: JSON.stringify(summary, null, 2) }));
```

The function's role can read only under `uploads/` and write only under `processed/`, set in `provider.iam.role.statements`:

```yaml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - s3:GetObject
          Resource: arn:aws:s3:::${self:custom.bucket}/uploads/*
        - Effect: Allow
          Action:
            - s3:PutObject
          Resource: arn:aws:s3:::${self:custom.bucket}/processed/*
```

The bucket's name is a stack output, declared under `resources.Outputs`, so that `serverless info --verbose` prints it.

## Cost and cleanup

While the example is deployed, Amazon S3 bills the objects it stores and the requests to them, Lambda bills each invocation and the function's compute time, and CloudWatch Logs bills the function's stored log data. See [Amazon S3 pricing](https://aws.amazon.com/s3/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).

CloudFormation deletes only an empty bucket, so delete the bucket's objects first, then remove the stack with the bucket, the function and its log group:

```bash
aws s3 rm "s3://$BUCKET" --recursive
serverless remove
```

## Next steps

- Read [S3 bucket events](https://www.serverless.com/framework/docs/providers/aws/events/s3) for other event types, suffix rules, several functions on one bucket and adding notifications to a bucket that already exists.
- Write results to a second bucket instead of a prefix: declare it under [`provider.s3`](https://www.serverless.com/framework/docs/providers/aws/events/s3) and grant the function `s3:PutObject` on it.
- Store each result in a table instead of the bucket, as the [Express API with DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-node-express-dynamodb-api) does for API requests.
