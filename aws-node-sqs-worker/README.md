<!--
title: 'Node SQS Producer Consumer on AWS'
description: 'This example shows how a Lambda function behind an HTTP API puts jobs on an Amazon SQS queue and a worker function processes them in batches, reporting failed messages so they retry and then move to a dead-letter queue.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Process a queue with Amazon SQS and Lambda

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-sqs-worker.svg)](https://github.com/serverless/examples/blob/verified/results.json)

An HTTP endpoint can accept work and leave it for later: it puts each job on an Amazon SQS queue and answers at once, and a worker function processes the queue in batches. The [`sqs` event](https://www.serverless.com/framework/docs/providers/aws/events/sqs) of the Serverless Framework connects the worker to the queue. With partial batch responses the worker reports only the messages it couldn't process, so the rest of the batch is done, and a dead-letter queue takes a message that keeps failing, so it doesn't come back forever. This example accepts jobs at `POST /jobs`, processes the ones that name a task, and moves the others to the dead-letter queue after three tries.

## What it deploys

- An HTTP API with one route, `POST /jobs`, and a Lambda function, `producer`, that puts each job on the jobs queue.
- An SQS queue named `sqs-worker-<stage>-jobs`, and a dead-letter queue named `sqs-worker-<stage>-jobs-dlq` that keeps a failed job for 14 days.
- A Lambda function, `worker`, that Lambda invokes with batches of up to 10 messages from the jobs queue.
- An IAM role that lets the functions write their logs, lets `producer` send to the jobs queue only and lets `worker` read and delete its messages, and a CloudWatch Logs log group for each function.

## Prerequisites

- The Serverless Framework CLI: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- `curl`, to send jobs, and the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), to read the dead-letter queue. The commands in Try it are written for Bash.

## Deploy

Deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "sqs-worker" to stage "dev" (us-east-1)
✔ Service deployed to stack sqs-worker-dev (119s)
endpoint: POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/jobs

functions:
  producer: sqs-worker-dev-producer (8 kB)
  worker: sqs-worker-dev-worker (8 kB)
```

## Try it

Copy the endpoint from the deploy output into a shell variable:

```bash
URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/jobs
```

Send a job with a task, and a job without one:

```bash
curl -X POST "$URL" -H 'content-type: application/json' --data '{"task": "resize photo-1.png"}'
curl -X POST "$URL" -H 'content-type: application/json' --data '{"name": "photo-2.png"}'
```

The API answers each with status 202 and the ID of the SQS message, before the job is processed:

```json
{"messageId":"ec7e4da2-61be-4b48-a044-75f90574a751"}
{"messageId":"7ab82ef6-12ea-4e01-9204-15c5b6ad7059"}
```

Lambda polls the queue and invokes `worker` a moment later. Its log shows the first job processed. The second job fails, goes back to the queue, and is received again each time the queue's 36-second visibility timeout ends:

```bash
serverless logs --function worker
```

```text
INFO	Processed job ec7e4da2-61be-4b48-a044-75f90574a751: resize photo-1.png
ERROR	Job 7ab82ef6-12ea-4e01-9204-15c5b6ad7059 failed on receive 1: the job has no "task" string
ERROR	Job 7ab82ef6-12ea-4e01-9204-15c5b6ad7059 failed on receive 2: the job has no "task" string
ERROR	Job 7ab82ef6-12ea-4e01-9204-15c5b6ad7059 failed on receive 3: the job has no "task" string
```

If the command prints `No existing streams for the function`, or a line isn't there yet, the worker hasn't run yet: wait a few seconds and run the command again.

After the third failure, SQS moves the job to the dead-letter queue, about two minutes after it was sent. Show the stack outputs to find the dead-letter queue's URL:

```bash
serverless info --verbose
```

```text
Stack Outputs:
  DeadLetterQueueUrl: https://sqs.us-east-1.amazonaws.com/123456789012/sqs-worker-dev-jobs-dlq
```

Read the job from the dead-letter queue with the AWS CLI:

```bash
aws sqs receive-message --region us-east-1 \
  --queue-url https://sqs.us-east-1.amazonaws.com/123456789012/sqs-worker-dev-jobs-dlq \
  --query 'Messages[].[MessageId,Body]' --output text
```

```text
7ab82ef6-12ea-4e01-9204-15c5b6ad7059	{"name":"photo-2.png"}
```

A body that isn't a JSON object gets status 400 and `{"error":"Send a JSON object as the body."}`, and nothing is queued.

## How it works

The `sqs` event in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-sqs-worker/serverless.yml) creates the event source mapping: Lambda polls the queue, invokes `worker` with up to 10 messages, and deletes the messages the worker processed. `functionResponseType: ReportBatchItemFailures` lets the worker name the messages it couldn't process, so only those return to the queue:

```yaml
functions:
  worker:
    handler: handler.worker
    events:
      - sqs:
          arn: !GetAtt JobsQueue.Arn
          batchSize: 10
          functionResponseType: ReportBatchItemFailures
```

The `sqs` event doesn't create queues, so both queues are declared under `resources`. The jobs queue's `RedrivePolicy` moves a message that was received three times without being deleted to the dead-letter queue. Its visibility timeout is at least the worker's timeout (6 seconds by default), as Lambda requires, and six times it, as AWS recommends:

```yaml
resources:
  Resources:
    JobsQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:service}-${sls:stage}-jobs
        VisibilityTimeout: 36
        RedrivePolicy:
          deadLetterTargetArn: !GetAtt DeadLetterQueue.Arn
          maxReceiveCount: 3

    DeadLetterQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:service}-${sls:stage}-jobs-dlq
        MessageRetentionPeriod: 1209600
```

Queue names are unique per account and Region, so the names include the stage: two stages get two pairs of queues. The `producer` function gets the jobs queue's URL in an environment variable, and its role may send to that queue only:

```yaml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - sqs:SendMessage
          Resource: !GetAtt JobsQueue.Arn

functions:
  producer:
    handler: handler.producer
    environment:
      QUEUE_URL: !Ref JobsQueue
    events:
      - httpApi:
          path: /jobs
          method: post
```

[`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-sqs-worker/handler.mjs) holds both functions. `producer` sends the job with the AWS SDK for JavaScript v3, which the Node.js runtime includes, and returns the message ID. `worker` processes each message of the batch on its own, and returns the IDs of the messages that failed in `batchItemFailures`:

```javascript
export const worker = async (event) => {
  const batchItemFailures = [];
  for (const record of event.Records) {
    try {
      const job = JSON.parse(record.body);
      if (typeof job.task !== 'string' || job.task.trim() === '') throw new Error('the job has no "task" string');
      console.log(`Processed job ${record.messageId}: ${job.task}`);
    } catch (err) {
      console.error(`Job ${record.messageId} failed on receive ${record.attributes.ApproximateReceiveCount}: ${err.message}`);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };
};
```

If the worker threw instead, Lambda would return every message of the batch to the queue, and the jobs that succeeded would run again. See [Handling errors for an SQS event source in Lambda](https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html).

## Cost and cleanup

While the example is deployed, API Gateway bills each request to the HTTP API, Amazon SQS bills each request to the queues (sending, Lambda's polling, and receiving and deleting messages), Lambda bills each invocation and the functions' compute time, and CloudWatch Logs bills the functions' stored log data. See [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/), [Amazon SQS pricing](https://aws.amazon.com/sqs/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).

Remove the API, the queues and the messages in them, the functions and their log groups:

```bash
serverless remove
```

## Next steps

- Read [SQS queue events](https://www.serverless.com/framework/docs/providers/aws/events/sqs) for batching windows, filter patterns that send the worker only some messages, maximum concurrency and FIFO queues.
- Move the jobs from the dead-letter queue back to the jobs queue once the worker can process them, with a [dead-letter queue redrive](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-dead-letter-queue-redrive.html).
- Deliver each message to several subscribers instead of one worker, as the [SNS example](https://github.com/serverless/examples/tree/v4/aws-node-text-analysis-via-sns-post-processing) does.
