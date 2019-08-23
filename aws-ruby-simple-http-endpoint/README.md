<!--
title: .'AWS Simple HTTP Endpoint example in Ruby'
description: 'This example demonstrates how to setup a simple HTTP GET endpoint. Once you ping it, it will reply with the current time.'
framework: v1
platform: AWS
language: Ruby
authorLink: 'https://github.com/josephyi'
authorName: 'Joseph Yi'
authorAvatar: 'https://avatars0.githubusercontent.com/u/1994863?v=4&s=140'
-->

# Simple HTTP Endpoint Example

Inspired by the [aws-node-simple-http-endpoint](https://github.com/serverless/examples/tree/master/aws-node-simple-http-endpoint), in Ruby!

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Deploy 

In order to deploy the endpoint, simply run:

```bash
sls deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (849 B)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
...............................
Serverless: Stack update finished...
Service Information
service: serverless-ruby-simple-http-endpoint
stage: dev
region: us-east-1
stack: serverless-ruby-simple-http-endpoint-dev
api keys:
  None
endpoints:
  GET - https://spmfbzc6ja.execute-api.us-east-1.amazonaws.com/dev/ping
functions:
  current_time: serverless-ruby-simple-http-endpoint-dev-current_time
layers:
  None
Serverless: Removing old service artifacts from S3...
```
## Usage

Send an HTTP request directly to the endpoint using a tool like curl:

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/ping
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).