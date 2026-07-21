<!--
title: 'Serverless Framework Node SQS Producer-Consumer on AWS'
description: 'This template demonstrates how to develop and deploy a simple SQS-based producer-consumer service running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node SQS Producer-Consumer on AWS

This template demonstrates how to build a producer-consumer service on AWS Lambda using the Serverless Framework. A `producer` function is exposed over HTTP API and accepts JSON payloads, which it forwards to an SQS queue for asynchronous processing. A `consumer` function is subscribed to that same queue and processes each message as it arrives.

This template does not include any kind of persistence (database). For more advanced examples, check out the [serverless/examples repository](https://github.com/serverless/examples/) which includes Typescript, Mongo, DynamoDB and other examples.

## Anatomy of the template

This template defines two functions, `producer` and `consumer`, and one SQS queue, `JobsQueue`.

- `producer` is triggered by an `httpApi` event on `POST /produce`. It accepts any request body and sends it as a message to `JobsQueue`, then responds immediately with a `202` status so the caller doesn't have to wait for the message to be processed.
- `consumer` is triggered by an `sqs` event sourced from `JobsQueue` with a batch size of 10. It logs each message it receives; this is where you would add your own background processing logic.

To learn more:

- about `httpApi` event configuration options, refer to the [HTTP API (API Gateway V2) event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api)
- about `sqs` event configuration options, refer to the [SQS event docs](https://www.serverless.com/framework/docs/providers/aws/events/sqs)
- about SQS processing with AWS Lambda, refer to the official [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html)

## Usage

### Deployment

Install dependencies with:

```
npm install
```

Then deploy with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "sqs-worker" to stage "dev" (us-east-1)

✔ Service deployed to stack sqs-worker-dev (78s)

endpoint: POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/produce
functions:
  producer: sqs-worker-dev-producer (1.8 kB)
  consumer: sqs-worker-dev-consumer (1.8 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to the [HTTP API (API Gateway V2) event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api).

### Invocation

After successful deployment, you can submit a job by sending a `POST` request to the `/produce` endpoint:

```
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/produce -d '{"job":"hello"}'
```

Which should result in a response similar to:

```json
{ "status": "queued" }
```

with an HTTP status code of `202`.

The message is placed on the `JobsQueue` SQS queue, and the `consumer` function picks it up and processes it. You can view its logs with:

```
serverless logs -f consumer
```

Which should print output similar to:

```
processing job 9d1f2e3a-... {"job":"hello"}
```

### Removal

When you are done, you can remove the service and all of its resources with:

```
serverless remove
```
