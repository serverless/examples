<!--
title: AWS Analyse Image from S3 with Amazon Rekognition example in NodeJS
description: This example shows how to analys an image in an S3 bucket with Amazon Rekognition and return a list of labels.
layout: Doc
-->
# Analyse Image from S3 with Amazon Rekognition Example

This example shows how to analys an image in an S3 bucket with Amazon Rekognition and return a list of labels.

## Use-cases

- Determine if there is a cat in an image.

## Setup

You need to create an S3 bucket and upload at least one file. Be sure the permissions on the folder and file allow public access and that CORS is configured to allow access.

```bash
npm install
```

## Deploy

In order to deploy the function run:

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (3.78 MB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...
Service Information
service: rekognition-analysis-s3-image
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - https://6bbhhv5q22.execute-api.us-east-1.amazonaws.com/dev/analysis
functions:
  imageAnalysis: rekognition-analysis-s3-image-dev-imageAnalysis
```

## Usage

You can now send an HTTP POST request directly to the endpoint using a tool like curl

```
{
  "bucket": "mycatphotos",
  "imageName": "cat.jpg"
}
```

```bash
serverless invoke local -f imageAnalysis -p post.json
```

The expected result should be similar to:

```json
{
    "Labels": [
        {
            "Confidence": 96.59198760986328,
            "Name": "Animal"
        },
        {
            "Confidence": 96.59198760986328,
            "Name": "Cat"
        },
        {
            "Confidence": 96.59198760986328,
            "Name": "Pet"
        },
        {
            "Confidence": 96.59198760986328,
            "Name": "Siamese"
        }
    ]
}
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
