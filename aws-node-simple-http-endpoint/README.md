<!--
title: AWS Simple HTTP Endpoint example in NodeJS
description: This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time.
layout: Doc
-->
# Simple HTTP Endpoint Example

This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time. While the internal function is name `currentTime` the HTTP endpoint is exposed as `ping`.

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Invoke the function locally

```bash
serverless invoke local --function currentTime
```

Which should result in:

```bash
Serverless: Your function ran successfully.

{
    "statusCode": 200,
    "body": "{\"message\":\"Hello, the current time is 12:49:06 GMT+0100 (CET).\"}"
}
```

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
...........................
Serverless: Stack update finished…

Service Information
service: serverless-simple-http-endpoint
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  GET - https://2e16njizla.execute-api.us-east-1.amazonaws.com/dev/ping
functions:
  serverless-simple-http-endpoint-dev-currentTime: arn:aws:lambda:us-east-1:488110005556:function:serverless-simple-http-endpoint-dev-currentTime
```

## Usage

You can now invoke the Lambda directly and even see the resulting log via

```bash
serverless invoke --function currentTime --log
```

or as send an HTTP request directly to the endpoint using a tool like curl

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/ping
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
