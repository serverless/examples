<!--
title: 'AWS Node Scheduled Cron example in NodeJS'
description: 'This is an example of creating a function that runs as a cron job using the serverless ''schedule'' event.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/0dj0bz'
authorName: 'Rob Abbott'
authorAvatar: 'https://avatars3.githubusercontent.com/u/5679763?v=4&s=140'
-->

# Serverless Framework Node Scheduled Cron on AWS

This template demonstrates how to develop and deploy a simple cron-like service running on AWS Lambda using the Serverless Framework.

This examples defines a single function, `rateHandler` which is triggered by an event of `schedule` type at a rate of 1 per minute. For detailed information about `schedule` event, please refer to corresponding section of Serverless [docs](https://serverless.com/framework/docs/providers/aws/events/schedule/).

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "aws-node-scheduled-cron" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-scheduled-cron-dev (151s)

functions:
  rateHandler: aws-node-scheduled-cron-dev-rateHandler (2.3 kB)

```

There is no additional step required. Your defined schedules becomes active right away after deployment.

### Local development

The easiest way to develop and test your function is to use the `dev` command:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine: each scheduled run, or a `serverless invoke --function rateHandler`, runs your local code, with your function's deployed configuration and permissions. Edit the code and the next invocation runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; your function runs the deployed code again. Deploy with `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).
