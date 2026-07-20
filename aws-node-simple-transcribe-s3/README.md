<!--
title: Simple AWS Transcribe example in NodeJS
description: This example demonstrates how to setup a lambda function to transcribe your audio file (.wav format) into a text transcription. The lambda will be triggered whenever a new audio file is uploaded to S3 and the transcription (JSON format) will be saved to a S3 bucket.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/t49tran'
authorName: 'Duong Tran'
authorAvatar: 'https://avatars0.githubusercontent.com/u/2223362?v=4&s=140'
-->
# Simple AWS Transcribe example in NodeJS

This example demonstrates how to setup a lambda function to transcribe your audio file (.wav format) into a text transcription. The lambda will be triggered whenever a new audio file is uploaded to S3 and the transcription (JSON format) will be saved to a S3 bucket.

## Use Cases

- Transcribe your audio file (voice messages, phone recordings) to text using AWS Transcribe

## Setup

- Edit `serverless.yml` and change the language code if you need to, at the moment: 
`en-US | es-US | en-AU | fr-CA | en-UK`
is supported

- Declare AWS region if you need to, beware that at the moment, AWS Transcribe is not supported for all regions.

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```
Deploying "aws-node-simple-transcribe-s3" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-simple-transcribe-s3-dev (44s)

functions:
  transcribe: aws-node-simple-transcribe-s3-dev-transcribe (1.3 kB)
```

## Usage

- Upload a audio file to your S3 audio bucket
- A transcription job should be created in AWS Transcribe
- The result (in JSON format) should then be found in the S3 transcription bucket
