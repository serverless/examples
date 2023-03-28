<!--
title: 'AWS SQS Standard Example (NodeJS & Typescript)'
description: 'This example demonstrates how to setup a SQS with Typescript.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/jmpfrazao'
authorName: 'Miguel Frazao'
authorAvatar: 'https://avatars3.githubusercontent.com/u/28927258?s=460&v=4'
-->

# Simple SQS Standard Example

This example demonstrates how to setup a SQS Standard and send messages through the message body and attributes.

The queue was created by using the [queue construct from the Lift plugin](https://github.com/getlift/lift/blob/master/docs/queue.md).

## Use Cases

- Decouple message producers from message consumers.
- This is one way to architect for scale and reliability.

## Setup

`npm install` to install all needed packages.

## Deployment

In order to deploy the service run:

```bash
sls deploy
```

for deploying with a specific `profile` (located in `~/.aws/credentials`) you can simply use the command:

```bash
AWS_PROFILE=YOUR_PROFILE_NAME sls deploy
```

for deploying to the specific stage, let's say `staging` do:

```bash
sls deploy --stage staging
```

The expected result should be similar to:

```bash
✔ Service deployed to stack aws-node-typescript-sqs-standard-dev (345s)

endpoint: POST - https://XXXXXXXXX.execute-api.REGION.amazonaws.com/sender
functions:
  sender: aws-node-typescript-sqs-standard-STAGE-sender (8 MB)
   receiver: aws-node-typescript-sqs-standard-dev-receiver (8 MB)
  mySimpleQueueWorker: aws-node-typescript-sqs-standard-YOUR-STAGE-mySimpleQueueWorker (8 MB)
updateData: https://sqs.REGION.amazonaws.com/XXXXXXXXXXX/aws-node-typescript-sqs-standard-dev-mySimpleQueue
```

## Usage

- Send a HTTP POST request to the sender lambda with a JSON payload (The response will be `{"message":"Message placed in the Queue!"}`)
- To print out the logs of the receiver sqs handler on the terminal.
  `sls logs -f mySimpleQueueWorker -t`
  It will look like:
  ```bash
  serverless logs  -f mySimpleQueueWorker
  Running "serverless" from node_modules
  START
  2022-08-06 16:24:46.022 INFO    Message Attributtes -->   Attribute Value Here
  2022-08-06 16:24:46.023 INFO    Message Body -->   "test"
  END Duration: 2.83 ms (init: 155.47 ms) Memory Used: 56 MB
  ```
- Alternatively you can check cloudwatch logs.
