<!--
title: AWS Node Scheduled Cron example in NodeJS
description: This is an example of creating a function that runs as a cron job using the serverless 'schedule' event.
layout: Doc
-->
# AWS Node Scheduled Cron Example

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
START RequestId: e6e64a4e-b57d-11e6-9eee-0340b40f6d48 Version: $LATEST
2016-11-28 16:18:23.755 (+01:00)	e6e64a4e-b57d-11e6-9eee-0340b40f6d48	Your cron function "scheduled-cron-example-dev-cron" ran at Mon Nov 28 2016 15:18:23 GMT+0000 (UTC)
END RequestId: e6e64a4e-b57d-11e6-9eee-0340b40f6d48
REPORT RequestId: e6e64a4e-b57d-11e6-9eee-0340b40f6d48	Duration: 4.01 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 16 MB

START RequestId: 0a770e6f-b57e-11e6-ba68-f188460981c7 Version: $LATEST
2016-11-28 16:19:22.921 (+01:00)	0a770e6f-b57e-11e6-ba68-f188460981c7	Your cron function "scheduled-cron-example-dev-cron" ran at Mon Nov 28 2016 15:19:22 GMT+0000 (UTC)
END RequestId: 0a770e6f-b57e-11e6-ba68-f188460981c7
REPORT RequestId: 0a770e6f-b57e-11e6-ba68-f188460981c7	Duration: 0.69 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 16 MB
```

Since this only shows you the logs of the first cron job simply change the function name and run the command again:

```bash
serverless logs --function secondCron --tail
```


## Additonal Resources

For more information on running cron with Serverless check out the [Tutorial: Serverless Scheduled Tasks](https://parall.ax/blog/view/3202/tutorial-serverless-scheduled-tasks) by Parallax.
