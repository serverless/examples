<!--
title: 'AWS Python Scheduled Cron example in Python'
description: 'A Python function on AWS Lambda that runs once a minute, triggered by the Serverless Framework schedule event.'
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

This template deploys a Python function on AWS Lambda that runs once a minute, like a cron job. Use it as the starting point for periodic work such as cleanups, reports or polling.

## What it deploys

- A Lambda function, `rateHandler`.
- An EventBridge rule that invokes the function every minute.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

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
✔ Service deployed to stack aws-python-scheduled-cron-dev (102s)
functions:
  rateHandler: aws-python-scheduled-cron-dev-rateHandler (2.9 kB)
```

The schedule is active as soon as the deploy finishes; there is no further step.

## Try it

Invoke the function now instead of waiting for the next run, and print its log:

```bash
serverless invoke --function rateHandler --log
```

The log printed after the response contains the line the handler writes, `Your cron function ran at`, followed by the current time.

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

`rate(1 minute)` runs the function every minute. A `cron(...)` expression runs it at fixed times instead; the [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) list both forms, and the [AWS docs on schedule expressions](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html) describe the cron syntax.

`handler.py` logs the time of each run:

```python
def run(event, context):
    current_time = datetime.datetime.now().time()
    logger.info("Your cron function ran at " + str(current_time))
```

### Run it locally

Invoke the function on your machine:

```bash
serverless invoke local --function rateHandler
```

The output contains the same `Your cron function ran at` line, with your local time.

### Add dependencies

The Framework packages Python dependencies itself, with no plugin. List them in a `requirements.txt` file and add a `custom.pythonRequirements` block to `serverless.yml` to turn the packaging on:

```yaml
custom:
  pythonRequirements: {}
```

The deploy then installs the requirements into the Lambda package. `Pipfile` and `pyproject.toml` work too, with the configuration the [Python requirements guide](https://www.serverless.com/framework/docs/providers/aws/guide/python) describes.

## Cost and cleanup

The rule invokes the function every minute for as long as it is deployed, so Lambda bills an invocation and its compute time every minute, whether or not you look at the results. Each run also adds a line to the function's logs in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [EventBridge pricing](https://aws.amazon.com/eventbridge/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, the rule and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [schedule event docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule) for cron expressions, inputs and disabling a schedule.
- Start from a function with no events in the [AWS Python example](https://github.com/serverless/examples/tree/v4/aws-python).
- Process messages from a queue instead of a timer with the [SQS worker example](https://github.com/serverless/examples/tree/v4/aws-python-sqs-worker).
