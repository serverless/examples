<!--
title: 'AWS Node Scheduled Cron example in NodeJS'
description: 'A Node.js function on AWS Lambda that runs once a minute, and one that runs at 9 AM New York time on weekdays, triggered by the Serverless Framework schedule event.'
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

This template deploys two Node.js functions on AWS Lambda that run on a schedule, like cron jobs: one runs once a minute, the other at 9 AM New York time on weekdays. Use it as the starting point for periodic work such as cleanups, reports or polling.

## What it deploys

- A Lambda function, `rateHandler`, and an EventBridge rule that invokes it every minute.
- A Lambda function, `cronHandler`, and an EventBridge Scheduler schedule that invokes it at 9 AM on weekdays in the `America/New_York` time zone.
- An IAM role for the functions, which EventBridge Scheduler also uses to invoke `cronHandler`, and a CloudWatch Logs log group for each function.

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
  rateHandler: aws-node-scheduled-cron-dev-rateHandler (4.2 kB)
  cronHandler: aws-node-scheduled-cron-dev-cronHandler (4.2 kB)
```

The schedules are active as soon as the deploy finishes; there is no further step.

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

`cronHandler` runs only at 9 AM on weekdays. To run it now, invoke it the same way:

```bash
serverless invoke --function cronHandler --log
```

The log contains the line `cronHandler` writes, `Your weekday cron function ran at`, followed by the current date and time:

```text
null

----------------------

START - a15ae131-f467-45d4-942f-b66be46e65b0 - Version: $LATEST
2026-11-25 21:57:46.962 - a15ae131-f467-45d4-942f-b66be46e65b0 -
INFO	Your weekday cron function ran at Wed Nov 25 2026 21:57:46 GMT+0000 (Coordinated Universal Time)

REPORT - a15ae131-f467-45d4-942f-b66be46e65b0
Duration: 6.77 ms	Billed Duration: 143 ms	Memory Size: 1024 MB	Max Memory Used: 77 MB	Init Duration: 135.98 ms
```

`serverless invoke` calls the function directly, not through its schedule, so you can test a cron function at any time of day.

## How it works

`serverless.yml` attaches a `schedule` event to each function:

```yaml
functions:
  rateHandler:
    handler: handler.run
    events:
      - schedule: rate(1 minute)
  cronHandler:
    handler: handler.cron
    events:
      - schedule:
          method: scheduler
          rate: cron(0 9 ? * MON-FRI *)
          timezone: America/New_York
```

A schedule is written as a rate or a cron expression:

- `rate(1 minute)` runs the function at a fixed interval. The unit is `minute`, `hour` or `day` for a value of 1, and `minutes`, `hours` or `days` for larger values.
- `cron(0 9 ? * MON-FRI *)` runs it at fixed times. A cron expression has six fields: minutes, hours, day of month, month, day of week and year. One of day of month and day of week must be `?`, because you can't set both: here the day of week is set (`MON-FRI`), so the day of month is `?`.

The two functions also use the two ways the Framework creates a schedule:

- **EventBridge rule**, the default. `rateHandler`'s event becomes a scheduled rule on the default event bus. A rule evaluates cron expressions in UTC.
- **EventBridge Scheduler**, with `method: scheduler`. `cronHandler`'s event becomes an EventBridge Scheduler schedule, which evaluates the cron expression in the time zone set in `timezone`, an IANA name such as `America/New_York`, and follows daylight saving time. Without `timezone`, Scheduler uses UTC. Scheduler invokes the function with the function's IAM role, and the Framework adds what that needs to the role.

To run a cron schedule at a local time, use `method: scheduler` with `timezone`. The [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) list all options of both methods, and the [AWS docs on schedule expressions](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html) describe the cron syntax.

`handler.js` logs the time of each run, with a different line for each function:

```javascript
exports.run = async () => {
  const time = new Date();
  console.log(`Your cron function ran at ${time}`);
};

exports.cron = async () => {
  const time = new Date();
  console.log(`Your weekday cron function ran at ${time}`);
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

The rule invokes `rateHandler` every minute and the schedule invokes `cronHandler` five times a week, for as long as they are deployed, so Lambda bills each invocation and its compute time, whether or not you look at the results. EventBridge Scheduler bills each invocation it makes. Each run also adds lines to the function's logs in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [EventBridge pricing](https://aws.amazon.com/eventbridge/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the functions, the rule, the schedule and the log groups, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) for inputs, names and disabling a schedule.
- Start from a function with no events in the [AWS Node.js example](https://github.com/serverless/examples/tree/v4/aws-node).
- Process messages from a queue instead of a timer with the [SQS worker example](https://github.com/serverless/examples/tree/v4/aws-node-sqs-worker).
