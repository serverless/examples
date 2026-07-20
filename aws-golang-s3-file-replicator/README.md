<!--
title: 'AWS S3 Bucket Replicator in Golang'
description: 'Boilerplate code for Golang with S3 object create event and replicator example'
framework: v4
platform: AWS
language: Go
priority: 10
authorLink: 'https://github.com/p0n2'
authorName: 'p0n2'
authorAvatar: 'https://avatars3.githubusercontent.com/u/59630164'
-->

# Serverless-golang AWS S3 object create event and replicator example

Serverless boilerplate code for golang with S3 object create event and replicator example

The example shows following steps:

1. Detect object create event with input bucket
2. Copy detected object and duplicate object to new bucket with assigned object name.
3. [optional] you will able to append file extension or rename object name with assign object name.

## Buckets

This example replicates objects between two **pre-existing** S3 buckets (`existing: true` —
the framework attaches a notification to buckets you create yourself; it does not create
them). By default the bucket names are account-unique (`replicator-input-<awsAccountId>` /
`replicator-output-<awsAccountId>`), so create them once per account before deploying:

```bash
aws s3 mb s3://replicator-input-<awsAccountId>
aws s3 mb s3://replicator-output-<awsAccountId>
```

To use different bucket names, set `INPUT_BUCKET` / `OUTPUT_BUCKET` environment variables
before deploying.

## Build & Deploy

Requires Go 1.25+. The function is compiled to a `provided.al2023` (arm64) custom-runtime
bootstrap and uses the AWS SDK for Go v2.

```bash
make build
serverless deploy
```
