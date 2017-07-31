<!--
title: AWS Function compiled with Babel example in NodeJS
description: This example demonstrates how to compile your JavaScript code with Babel. In order to do so the 'serverless-babel-plugin' is leveraged.
layout: Doc
-->
# Function compiled with Babel

This example demonstrates how to compile your JavaScript code with Babel. In order to do so the `serverless-babel-plugin` is leveraged.

## Use Cases

- Using the latest JavaScript language features without waiting for AWS to provide new Node environments.

## Setup

```bash
npm install
```

## Deploy

```bash
serverless deploy
```

```bash
Serverless: Deprecation Notice: Starting with the next update, we will drop support for Lambda to implicitly create LogGroups. Please remove your log groups and set "provider.cfLogs: true", for CloudFormation to explicitly create them for you.
Serverless: Packaging service…
Serverless: Babel compilation:
tmpBabelDirectory/createResponse.js -> tmpBabelDirectory/createResponse.js
tmpBabelDirectory/handler.js -> tmpBabelDirectory/handler.js

Serverless: Packaging service with compiled files...
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
............
Serverless: Stack update finished…

Service Information
service: function-compiled-with-babel
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  function-compiled-with-babel-dev-hello: arn:aws:lambda:us-east-1:377024778620:function:function-compiled-with-babel-dev-hello
```

## Usage

You can now invoke the Lambda directly and even see the resulting log via

```bash
serverless invoke --function hello --log
```

The expected result should be similar to:

```bash
{
    "statusCode": 200,
    "body": {
        "message": "Success!"
    }
}
--------------------------------------------------------------------
START RequestId: 4388ee49-affe-11e6-9e69-1bde31ed2e43 Version: $LATEST
2016-11-21 16:22:07.748 (+01:00)	4388ee49-affe-11e6-9e69-1bde31ed2e43	{ response: { statusCode: 200, body: { message: 'Success!' } } }
END RequestId: 4388ee49-affe-11e6-9e69-1bde31ed2e43
REPORT RequestId: 4388ee49-affe-11e6-9e69-1bde31ed2e43	Duration: 23.13 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 17 MB
```
