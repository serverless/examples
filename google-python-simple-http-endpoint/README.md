<!--
title: 'GCF Simple HTTP Endpoint example in Python'
description: 'This example demonstrates how to setup a simple python HTTP GET endpoint on GCP Cloud Functions. When you ping the endpoint we've set up you'll see the time returned for the given request type.'
layout: Doc
framework: v1
platform: 'Google Cloud'
language: Python
authorLink: 'https://github.com/sebito91'
authorName: 'Sebastian Borza
authorAvatar: 'https://avatars0.githubusercontent.com/u/3159454?v=4&s=140'
-->

# Simple HTTP Endpoint Example

This example demonstrates how to setup a simple python HTTP GET endpoint. When you ping the endpoint we've set up here you'll see
the time returned for the given request type. While the internal function is name `currentTime` the HTTP endpoint is exposed as `ping`.

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (758 B)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..........
Serverless: Stack update finished...

Service Information
service: python-simple-http-endpoint
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  GET - https://f7r5srabr3.execute-api.us-east-1.amazonaws.com/dev/ping
functions:
  aws-python-simple-http-endpoint-dev-currentTime: arn:aws:lambda:us-east-1:377024778620:function:aws-python-simple-http-endpoint-dev-currentTime
```

## Usage

You can now invoke the Cloud Function directly and even see the resulting log via

```bash
serverless invoke --function currentTime --log
```

The expected result should be similar to:

```bash
{
    "body": "{\"message\": \"Hello, the current time is 15:40:19.009371\"}",
    "statusCode": 200
}
--------------------------------------------------------------------
START RequestId: a26699d3-b3ee-11e6-98f33f952e8294 Version: $LATEST
END RequestId: a26699d3-b3ee-11e6-98f33f952e8294
REPORT RequestId: a26699d3-b3ee-11e6-98f33f952e8294	Duration: 0.23 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

Finally you can send an HTTP request directly to the endpoint using a tool like curl

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/ping
```

The expected result should be similar to:

```bash
{"message": "Hello, the current time is 15:38:53.668501"}%
```
