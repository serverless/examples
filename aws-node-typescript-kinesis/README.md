<!--
title: 'AWS Kinesis Data Streams Example (NodeJS & Typescript)'
description: 'Produce and Consume data on a Kinesis Data Stream with Typescript.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/billkidwell'
authorName: 'Bill Kidwell'
authorAvatar: 'https://avatars0.githubusercontent.com/u/46457910?s=460&u=7c6d271ea7527f05e6c053cab571d32ffb3dbd38&v=4'
-->
# Simple Kinesis Example

This example demonstrates how to setup a Kinesis producer and consumer to send and receive messages through a Kinesis Data Stream.

## Use Cases
- Decouple message producers from message consumers.
- This is one way to architect for scale and reliability.
- Real-time processing of streaming data

## Setup
- sls deploy

## Usage
- To send a message to the producer, get the address from your sls deploy output.

```
Serverless: Stack update finished...
Service Information
service: aws-node-typescript-kinesis
stage: dev
region: us-east-1
stack: aws-node-typescript-kinesis-dev
resources: 16
api keys:
  None
endpoints:
  POST - https://xxx.execute-api.us-east-1.amazonaws.com/dev/producer
functions:
  producer: aws-node-typescript-kinesis-dev-producer
  consumer: aws-node-typescript-kinesis-dev-consumer
layers:
  None
```
- To print out the logs of the Kinesis consumer handler on the terminal
  `sls logs -f consumer -t`

- send a HTTP POST request to the producer lambda

```
curl -d "{ 'key': 'employee', 'value': 'Bill' }" \
https://xxx.execute-api.us-east-1.amazonaws.com/dev/producer
```

- You should see confirmation that the message was sent.  `{"message":"Message placed in the Event Stream!"}`

- The logs from the consumer will be delayed several seconds.

```
INFO    Kinesis Message:
          partition key: eb2da704-4972-4bd7-8c25-cce1decce95d
          sequence number: 49608726715828497972227004620876254203171519877947064322
          kinesis schema version: 1.0
          data: { 'key': 'employee', 'value': 'Bill' }
```

## Acknowledgements
Adapted from Miguel Frazao's [SQS Standard example](https://github.com/serverless/examples/tree/master/aws-node-typescript-sqs-standard).
