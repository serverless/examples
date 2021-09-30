<!--
title: 'AWS Simple HTTP Endpoint example in Kotlin & Gradle'
description: 'This example demonstrates how to setup a simple HTTP GET endpoint using Kotlin. Once you ping it, it will reply with the current time.'
layout: Doc
framework: v2
platform: AWS
language: Kotlin
priority: 10
authorLink: 'https://github.com/cthiebault'
authorName: 'Cedric Thiebault'
authorAvatar: 'https://avatars.githubusercontent.com/u/1970634'
-->
# Simple HTTP Endpoint Example with Kotlin & Gradle

Strongly inspired by [aws-java-simple-http-endpoint](../aws-java-simple-http-endpoint/).

This example demonstrates how to setup a simple HTTP GET endpoint using Kotlin & Gradle. 
Once you ping it, it will reply with the current time.

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Build with Gradle

```bash
./gradlew build
```

## Deploy

After having built the deployment artifact using Gradle you can deploy by simply running

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Service files not changed. Skipping deployment...
Service Information
service: aws-kotlin-simple-http-endpoint
stage: dev
region: us-east-1
stack: aws-kotlin-simple-http-endpoint-dev
resources: 11
api keys:
  None
endpoints:
  GET - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/ping
functions:
  currentTime: aws-kotlin-simple-http-endpoint-dev-currentTime
layers:
  None
```

## Usage

You can now invoke the Lambda function directly and even see the resulting log via

```bash
serverless invoke --function currentTime --log
```

The expected result should be similar to:

```bash
{
    "statusCode": 200,
    "headers": {
        "X-Powered-By": "AWS Lambda & Serverless",
        "Content-Type": "application/json"
    },
    "body": "Hello, the current time is Thu Sep 30 12:09:19 UTC 2021",
    "isBase64Encoded": false
}
--------------------------------------------------------------------
START RequestId: 4e150fca-fb2f-40f8-94cf-ff8af626a29e Version: $LATEST
2021-09-30 12:09:19 <4e150fca-fb2f-40f8-94cf-ff8af626a29e> INFO  com.serverless.Handler:13 - received: APIGatewayV2HTTPEvent(version=null, routeKey=null, rawPath=null, rawQueryString=null, cookies=null, headers=null, queryStringParameters=null, pathParameters=null, stageVariables=null, body=null, isBase64Encoded=false, requestContext=null)
END RequestId: 4e150fca-fb2f-40f8-94cf-ff8af626a29e
REPORT RequestId: 4e150fca-fb2f-40f8-94cf-ff8af626a29e  Duration: 3.90 ms       Billed Duration: 4 ms   Memory Size: 1024 MB    Max Memory Used: 102 MB 
```

Finally you can send an HTTP request directly to the endpoint using a tool like curl

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/ping
```

The expected result should be similar to:

```bash
{"message": "Hello, the current time is Wed Jan 04 23:44:37 UTC 2017"}%  
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 1000. 
The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during 
initial development and testing. To increase this limit above the default, follow the steps in 
[To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
