<!--
title: 'AWS Python Scheduled Cron example in Python'
description: 'A Python function on AWS Lambda that runs once a minute, and one that runs at 9 AM New York time on weekdays, triggered by the Serverless Framework schedule event.'
layout: Doc
framework: v4
platform: AWS
language: Python
priority: 9
authorLink: 'https://github.com/rupakg'
authorName: 'Rupak Ganguly'
authorAvatar: 'https://avatars0.githubusercontent.com/u/8188?v=4&s=140'
-->

# Serverless Framework Python Scheduled Cron on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-python-scheduled-cron.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys two Python functions on AWS Lambda that run on a schedule, like cron jobs: one runs once a minute, the other at 9 AM New York time on weekdays. Use it as the starting point for periodic work such as cleanups, reports or polling.

## What it deploys

- A Lambda function, `rateHandler`, and an EventBridge rule that invokes it every minute.
- A Lambda function, `cronHandler`, and an EventBridge Scheduler schedule that invokes it at 9 AM on weekdays in the `America/New_York` time zone.
- An IAM role for the functions, which EventBridge Scheduler also uses to invoke `cronHandler`, and a CloudWatch Logs log group for each function.

## Prerequisites

- [Python](https://www.python.org/) 3.14, to run the function locally and to package dependencies when you add them.
- [Node.js](https://nodejs.org/), to install the Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
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
Deploying "aws-python-scheduled-cron" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-python-scheduled-cron-dev (103s)
functions:
  rateHandler: aws-python-scheduled-cron-dev-rateHandler (4.5 kB)
  cronHandler: aws-python-scheduled-cron-dev-cronHandler (4.5 kB)
```

The schedules are active as soon as the deploy finishes; there is no further step.

## Try it

Invoke the function now instead of waiting for the next run, and print its log:

```bash
serverless invoke --function rateHandler --log
```

The function returns nothing, so the response is `null`. The log printed after it contains the line the handler writes, `Your cron function ran at`, followed by the current time in UTC:

```text
null

----------------------

START - 85562358-d2ef-43af-9ee5-43cc94ef2aed - Version: $LATEST
2026-11-25 20:43:43.932 - 85562358-d2ef-43af-9ee5-43cc94ef2aed - [INFO]
Your cron function ran at 20:43:43.932250

REPORT - 85562358-d2ef-43af-9ee5-43cc94ef2aed
Duration: 2.12 ms	Billed Duration: 3 ms	Memory Size: 1024 MB	Max Memory Used: 33 MB
```

To see the scheduled runs, read the function's logs. The first scheduled run comes within about a minute of the deploy, and each minute adds one more, next to the runs you invoked yourself; if no scheduled run is there yet, wait a minute and run the command again:

```bash
serverless logs --function rateHandler
```

```text
START - 8d3a87fb-dbd1-47ac-b578-baa6676a9e11 - Version: $LATEST
2026-11-25 20:44:33.725 - 8d3a87fb-dbd1-47ac-b578-baa6676a9e11 - [INFO]
Your cron function ran at 20:44:33.725330
END - 8d3a87fb-dbd1-47ac-b578-baa6676a9e11
REPORT - 8d3a87fb-dbd1-47ac-b578-baa6676a9e11
Duration: 1.74 ms	Billed Duration: 2 ms	Memory Size: 1024 MB	Max Memory Used: 33 MB
```

`cronHandler` runs only at 9 AM on weekdays. To run it now, invoke it the same way:

```bash
serverless invoke --function cronHandler --log
```

The log contains the line `cronHandler` writes, `Your weekday cron function ran at`, followed by the current time in UTC:

```text
null

----------------------

START - 0a4481d3-6b99-4536-9ef4-25118f2108f3 - Version: $LATEST
2026-11-25 21:59:57.500 - 0a4481d3-6b99-4536-9ef4-25118f2108f3 - [INFO]
Your weekday cron function ran at 21:59:57.500126

REPORT - 0a4481d3-6b99-4536-9ef4-25118f2108f3
Duration: 2.52 ms	Billed Duration: 93 ms	Memory Size: 1024 MB	Max Memory Used: 33 MB	Init Duration: 89.97 ms
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

`handler.py` logs the time of each run, with a different line for each function:

```python
def run(event, context):
    current_time = datetime.datetime.now().time()
    logger.info("Your cron function ran at " + str(current_time))


def cron(event, context):
    current_time = datetime.datetime.now().time()
    logger.info("Your weekday cron function ran at " + str(current_time))
```

### Run it locally

Invoke the function on your machine:

```bash
serverless invoke local --function rateHandler
```

The output contains the same `Your cron function ran at` line, with your local time. `serverless invoke local --function cronHandler` runs the weekday function the same way.

### Add dependencies

The Framework packages Python dependencies itself, with no plugin. List them in a `requirements.txt` file and add a `custom.pythonRequirements` block to `serverless.yml` to turn the packaging on:

```yaml
custom:
  pythonRequirements: {}
```

The deploy then installs the requirements into the Lambda package. `Pipfile` and `pyproject.toml` work too, with the configuration the [Python requirements guide](https://www.serverless.com/framework/docs/providers/aws/guide/python) describes.

## Cost and cleanup

The rule invokes `rateHandler` every minute and the schedule invokes `cronHandler` five times a week, for as long as they are deployed, so Lambda bills each invocation and its compute time, whether or not you look at the results. EventBridge Scheduler bills each invocation it makes. Each run also adds lines to the function's logs in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [EventBridge pricing](https://aws.amazon.com/eventbridge/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the functions, the rule, the schedule and the log groups, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) for inputs, names and disabling a schedule.
- Start from a function with no events in the [AWS Python example](https://github.com/serverless/examples/tree/v4/aws-python).
- Process messages from a queue instead of a timer with the [SQS worker example](https://github.com/serverless/examples/tree/v4/aws-python-sqs-worker).
