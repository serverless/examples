<!--
title: AWS Simple HTTP Endpoint example in Python
description: This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time.
layout: Doc
-->
# Simple HTTP Endpoint Example

This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time. While the internal function is name `currentTime` the HTTP endpoint is exposed as `ping`.

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
service: aws-python-simple-http-endpoint
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

You can now invoke the Lambda directly and even see the resulting log via

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
START RequestId: a26699d3-b3ee-11e6-9802-f33f952e8294 Version: $LATEST
END RequestId: a26699d3-b3ee-11e6-9802-f33f952e8294
REPORT RequestId: a26699d3-b3ee-11e6-9802-f33f952e8294	Duration: 0.23 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

Finally you can send an HTTP request directly to the endpoint using a tool like curl

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/ping
```

The expected result should be similar to:

```bash
{"message": "Hello, the current time is 15:38:53.668501"}%  
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
