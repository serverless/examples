<!--
title: AWS Serverless IoT Event example in NodeJS
description: This example demonstrates how to setup a AWS IoT Rule to send events to a Lambda function.
layout: Doc
-->
# Serverless IoT Event

This example demonstrates how to setup a AWS IoT Rule to send events to a Lambda function.

## Use-cases

- Analytics for IoT events
- Reacting on IoT events

## Setup

In order to deploy the function simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (363 B)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
................
Serverless: Stack update finished...
Service Information
service: aws-node-iot-event
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  aws-node-iot-event-dev-log: arn:aws:lambda:us-east-1:377024778620:function:aws-node-iot-event-dev-log
```

## Usage

In `serverless.yml` the log-function is configured to receive any event from the IoT Topic `mybutton`. We now can go to the IoT Console and visit the Tab `Test`.

![iot-console-test](https://cloud.githubusercontent.com/assets/223045/21593597/352be866-d119-11e6-9639-994b9c495571.png)

There fill `mybutton` into the topic input field in the publish section. Replace existing example data with the following example and press the publish button.

```json
{
  "message": "My first IoT event",
  "value": 2
}
```

![iot-console-form](https://cloud.githubusercontent.com/assets/223045/21593596/352be71c-d119-11e6-979a-7aa70abd2bf2.png)

To verify that our event was forwarded to our log-function run

```bash
serverless logs --function log
```

The expected result should be similar to:

```bash
START RequestId: 24192153-d10f-11e6-936c-a98ff4127599 Version: $LATEST
2017-01-02 18:16:04.768 (+01:00)	24192153-d10f-11e6-936c-a98ff4127599	{ message: 'My first IoT event', value: 2 }
END RequestId: 24192153-d10f-11e6-936c-a98ff4127599
REPORT RequestId: 24192153-d10f-11e6-936c-a98ff4127599	Duration: 23.53 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 8 MB
```

In the output you can see the IoT event that has been triggered from the test console.
