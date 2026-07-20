<!--
title: 'AWS S3 File Replicator'
description: 'This example creates 2 AWS S3 buckets and copies files in one bucket to the other'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/ac360'
authorName: 'Austen Collins'
authorAvatar: 'https://avatars3.githubusercontent.com/u/2752551?v=4&s=140'
-->
# AWS S3 File Replicator

This example creates 2 AWS S3 buckets and copies files in one bucket to the other. It's written in Node.js

The `inputBucket` and `outputBucket` are provisioned via the [`serverless-lift`](https://www.serverless.com/plugins/serverless-lift) `storage` construct, which creates an S3 bucket per construct with sensible defaults.

Simply upload a file to the inputs bucket (e.g. using the AWS S3 console) and see it be instantly transferred to the outputs bucket.

## Setup

```bash
npm install
```

## Deploy

```bash
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "replicator" to stage "dev" (us-east-1)

✔ Service deployed to stack replicator-dev (65s)

functions:
  replicate: replicator-dev-replicate (1.1 kB)
```
