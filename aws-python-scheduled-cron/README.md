<!--
title: AWS Python Scheduled Cron example in Python
description: This is an example of creating a function that runs as a cron job using the serverless 'schedule' event.
layout: Doc
-->
# AWS Python Scheduled Cron Example

This is an example of creating a function that runs as a cron job using the serverless `schedule` event. For more information on `schedule` event check out the Serverless docs on [schedule](https://serverless.com/framework/docs/providers/aws/events/schedule/).

Schedule events use the `rate` or `cron` syntax.

## Rate syntax

```pseudo
rate(value unit)
```

`value` - A positive number

`unit` - The unit of time. ( minute | minutes | hour | hours | day | days )

**Example** `rate(5 minutes)`

For more [information on the rate syntax see the AWS docs](http://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#RateExpressions)

## Cron syntax

```pseudo
cron(Minutes Hours Day-of-month Month Day-of-week Year)
```

All fields are required and time zone is UTC only.

| Field         | Values         | Wildcards     |
| ------------- |:--------------:|:-------------:|
| Minutes       | 0-59           | , - * /       |
| Hours         | 0-23           | , - * /       |
| Day-of-month  | 1-31           | , - * ? / L W |
| Month         | 1-12 or JAN-DEC| , - * /       |
| Day-of-week   | 1-7 or SUN-SAT | , - * ? / L # |
| Year          | 1970-2199      | , - * /       |

Read the [AWS cron expression syntax](http://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html) docs for more info on how to setup cron

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (1.47 KB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............
Serverless: Stack update finished...

Service Information
service: scheduled-cron-example
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  scheduled-cron-example-dev-cron: arn:aws:lambda:us-east-1:377024778620:function:scheduled-cron-example-dev-cron
  scheduled-cron-example-dev-secondCron: arn:aws:lambda:us-east-1:377024778620:function:scheduled-cron-example-dev-secondCron
```

There is no additional step required. Your defined schedule becomes active right away after deployment.

## Usage

To see your cron job running tail your logs with:

```bash
serverless logs --function cron --tail
```

The expected result should be similar to:

```bash
START RequestId: eddf3f49-be0a-11e6-8d48-73bdd3836e44 Version: $LATEST
Invalid date	2016-12-09T12:28:03.214Z	eddf3f49-be0a-11e6-8d48-73bdd3836e44	Your cron function aws-python-scheduled-cron-dev-cron ran at 12:28:03.214844
END RequestId: eddf3f49-be0a-11e6-8d48-73bdd3836e44
REPORT RequestId: eddf3f49-be0a-11e6-8d48-73bdd3836e44	Duration: 0.40 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 16 MB

START RequestId: af2da2ba-be0b-11e6-a2e2-05f86a84b0e4 Version: $LATEST
Invalid date	2016-12-09T12:33:27.715Z	af2da2ba-be0b-11e6-a2e2-05f86a84b0e4	Your cron function aws-python-scheduled-cron-dev-cron ran at 12:33:27.715374
END RequestId: af2da2ba-be0b-11e6-a2e2-05f86a84b0e4
REPORT RequestId: af2da2ba-be0b-11e6-a2e2-05f86a84b0e4	Duration: 0.32 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

Since this only shows you the logs of the first cron job simply change the function name and run the command again:

```bash
serverless logs --function secondCron --tail
```
