<!--
title: 'AWS Simple HTTP Endpoint example in Java'
description: 'This example demonstrates how to setup a simple HTTP GET endpoint using Java. Once you fetch it, it will reply with the current time.'
layout: Doc
framework: v4
platform: AWS
language: Java
priority: 10
authorLink: 'https://github.com/DoWhileGeek'
authorName: 'Joeseph Rodrigues'
authorAvatar: 'https://avatars3.githubusercontent.com/u/1767769?v=4&s=140'
-->
# Simple HTTP Endpoint Example

This example demonstrates how to setup a simple HTTP GET endpoint using Java. Once you fetch it, it will reply with the current time.

[Jackson](https://github.com/FasterXML/jackson) is used to serialize objects to JSON.

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Build

It is required to build prior to deploying. The function runs on the `java25` (arm64) managed
runtime. You can build the deployment artifact using Gradle or Maven.

### Gradle

In order to build using Gradle simply run

```bash
./gradlew build # to build the shaded application jar
```

The expected result should be similar to:

```bash
> Task :compileJava
> Task :processResources NO-SOURCE
> Task :classes
> Task :jar
> Task :shadowJar
> Task :assemble
> Task :compileTestJava NO-SOURCE
> Task :processTestResources NO-SOURCE
> Task :testClasses UP-TO-DATE
> Task :test NO-SOURCE
> Task :check UP-TO-DATE
> Task :build

BUILD SUCCESSFUL in 1s
3 actionable tasks: 3 executed
```

This produces `build/libs/aws-java-simple-http-endpoint.jar`, which is what `serverless.yml`
packages as the function artifact.

### Maven

In order to build using Maven simply run

```bash
mvn package
```

Note: you can install Maven with

1. [sdkman](http://sdkman.io/) using `sdk install maven` (yes, use as default)
2. `sudo apt-get install mvn`
3. `brew install maven`

If you use Maven to build, then in `serverless.yml` you have to replace

```yaml
package:
  artifact: build/libs/aws-java-simple-http-endpoint.jar
```
with
```yaml
package:
  artifact: target/aws-java-simple-http-endpoint.jar
```
before deploying.

## Deploy

After having built the deployment artifact using Gradle or Maven as described above you can deploy by simply running

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............................
Serverless: Stack update finished...
Service Information
service: aws-java-simple-http-endpoint
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  GET - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/time
functions:
  aws-java-simple-http-endpoint-dev-currentTime: arn:aws:lambda:us-east-1:XXXXXXX:function:aws-java-simple-http-endpoint-dev-currentTime

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
    "body": "{\"message\":\"Hello, the current time is Wed Jan 04 23:44:37 UTC 2017\"}",
    "headers": {
        "X-Powered-By": "AWS Lambda & Serverless",
        "Content-Type": "application/json"
    },
    "isBase64Encoded": false
}
--------------------------------------------------------------------
START RequestId: XXXXXXX Version: $LATEST
2004 23:44:37 <XXXXXXX> INFO  com.serverless.Handler:18 - received: {}
END RequestId: XXXXXXX
REPORT RequestId: XXXXXXX	Duration: 0.51 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 53 MB
```

Finally you can send an HTTP request directly to the endpoint using a tool like curl

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/time
```

The expected result should be similar to:

```bash
{"message": "Hello, the current time is Wed Jan 04 23:44:37 UTC 2017"}%  
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 1000. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
