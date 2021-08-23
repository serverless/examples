<!--
title: 'AWS Node Scheduled Cron example in NodeJS'
description: 'This is an example of creating a function that runs as a cron job using the serverless ''schedule'' event.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/0dj0bz'
authorName: 'Rob Abbott'
authorAvatar: 'https://avatars3.githubusercontent.com/u/5679763?v=4&s=140'
-->

# Serverless Framework Node Scheduled Cron on AWS

This template demonstrates how to develop and deploy a simple cron-like service running on AWS Lambda using the traditional Serverless Framework.

## Schedule event type

This examples defines two functions, `cron` and `secondCron`, both of which are triggered by an event of `schedule` type, which is used for configuring functions to be executed at specific time or in specific intervals. For detailed information about `schedule` event, please refer to corresponding section of Serverless [docs](https://serverless.com/framework/docs/providers/aws/events/schedule/).

When defining `schedule` events, we need to use `rate` or `cron` expression syntax.

### Rate expressions syntax

```pseudo
rate(value unit)
```

`value` - A positive number

`unit` - The unit of time. ( minute | minutes | hour | hours | day | days )

In below example, we use `rate` syntax to define `schedule` event that will trigger our `rateHandler` function every minute

```yml
functions:
  rateHandler:
    handler: handler.run
    events:
      - schedule: rate(1 minute)
```

Detailed information about rate expressions is available in official [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#RateExpressions).


### Cron expressions syntax

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
| Year          | 192199      | , - * /       |

In below example, we use `cron` syntax to define `schedule` event that will trigger our `cronHandler` function every second minute every Monday through Friday

```yml
functions:
  cronHandler:
    handler: handler.run
    events:
      - schedule: cron(0/2 * ? * MON-FRI *)
```

Detailed information about cron expressions in available in official [AWS docs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions).


## Usage

### Deployment

This example is made to work with the Serverless Framework dashboard, which includes advanced features such as CI/CD, monitoring, metrics, etc.

In order to deploy with dashboard, you need to first login with:

```
serverless login
```

and then perform deployment with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node-scheduled-cron.zip file to S3 (124.47 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.............................................
Serverless: Stack update finished...
Service Information
service: aws-node-scheduled-cron
stage: dev
region: us-east-1
stack: aws-node-scheduled-cron-dev
resources: 16
api keys:
  None
endpoints:
  None
functions:
  rateHandler: aws-node-scheduled-cron-dev-rateHandler
  cronHandler: aws-node-scheduled-cron-dev-cronHandler
layers:
  None
Serverless: Publishing service to the Serverless Dashboard...
Serverless: Successfully published your service to the Serverless Dashboard: https://app.serverless.com/xxxx/apps/xxxx/aws-node-scheduled-cron/dev/us-east-1
```

There is no additional step required. Your defined schedules becomes active right away after deployment.

### Local invocation

In order to test out your functions locally, you can invoke them with the following command:

```
serverless invoke local --function rateHandler
```

After invocation, you should see output similar to:

```bash
Your cron function "aws-node-scheduled-cron-dev-rateHandler" ran at Fri Mar 05 2021 15:14:39 GMT+0100 (Central European Standard Time)
```
