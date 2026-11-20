<!--
title: 'AWS Node Scheduled Cron example in NodeJS'
description: 'A Node.js function on AWS Lambda that runs once a minute, triggered by the Serverless Framework schedule event.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 4
authorLink: 'https://github.com/0dj0bz'
authorName: 'Rob Abbott'
authorAvatar: 'https://avatars3.githubusercontent.com/u/5679763?v=4&s=140'
-->

# Serverless Framework Node Scheduled Cron on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-scheduled-cron.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys a Node.js function on AWS Lambda that runs once a minute, like a cron job. Use it as the starting point for periodic work such as cleanups, reports or polling.

## What it deploys

- A Lambda function, `rateHandler`.
- An EventBridge rule that invokes the function every minute.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Run the deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-node-scheduled-cron" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-node-scheduled-cron-dev (103s)
functions:
  rateHandler: aws-node-scheduled-cron-dev-rateHandler (2.7 kB)
```

The schedule is active as soon as the deploy finishes; there is no further step.

## Try it

Invoke the function now instead of waiting for the next run, and print its log:

```bash
serverless invoke --function rateHandler --log
```

The command prints the function's response, `null`, then its log. The log contains the line the handler writes, `Your cron function ran at`, followed by the current date and time:

```text
null

----------------------

START - fe4200af-617b-483d-ad33-13c010a52dcf - Version: $LATEST
2026-11-19 15:13:15.616 - fe4200af-617b-483d-ad33-13c010a52dcf -
INFO	Your cron function ran at Thu Nov 19 2026 15:13:15 GMT+0000 (Coordinated Universal Time)

REPORT - fe4200af-617b-483d-ad33-13c010a52dcf
Duration: 1.95 ms	Billed Duration: 2 ms	Memory Size: 1024 MB	Max Memory Used: 78 MB
```

To see the scheduled runs, read the function's logs. Each minute adds one line:

```bash
serverless logs --function rateHandler
```

## How it works

`serverless.yml` attaches a `schedule` event to the function. The Framework turns it into an EventBridge rule:

```yaml
functions:
  rateHandler:
    handler: handler.run
    events:
      - schedule: rate(1 minute)
```

`rate(1 minute)` runs the function every minute. A `cron(...)` expression runs it at fixed times instead; the [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) list both forms and their options.

`handler.js` logs the time of each run:

```javascript
exports.run = async () => {
  const time = new Date();
  console.log(`Your cron function ran at ${time}`);
};
```

### Develop with Dev Mode

Start a Dev Mode session:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine. Each scheduled run, or a `serverless invoke --function rateHandler`, runs your local code, with the function's deployed configuration and permissions. Edit the code, and the next invocation runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; the function runs the deployed code again. Run `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).

## Cost and cleanup

The rule invokes the function every minute for as long as it is deployed, so Lambda bills an invocation and its compute time every minute, whether or not you look at the results. Each run also adds a line to the function's logs in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [EventBridge pricing](https://aws.amazon.com/eventbridge/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, the rule and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) for cron expressions, inputs and disabling a schedule.
- Start from a function with no events in the [AWS Node.js example](https://github.com/serverless/examples/tree/v4/aws-node).
- Process messages from a queue instead of a timer with the [SQS worker example](https://github.com/serverless/examples/tree/v4/aws-node-sqs-worker).
