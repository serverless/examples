<!--
title: 'Serverless Framework Node SQS Producer-Consumer on AWS'
description: 'This template demonstrates how to develop and deploy a simple SQS-based producer-consumer service running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v2
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node SQS Producer-Consumer on AWS

This template demonstrates how to develop and deploy a simple SQS-based producer-consumer service running on AWS Lambda using the traditional Serverless Framework and Serverless Lift plugin. It allows to accept messages, for which computation might be time or resource intensive, and offload their processing to an asynchronous background process for a faster and more resilient system.

## Anatomy of the template

This template defines one function `producer` and one Lift construct - `jobs`. Producer function is triggered by `http` event type, accepts JSON payload and sends it to a corresponding SQS queue for further processing. To learn more about `http` event configuration options, please refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/). Jobs construct is responsible for two things. It creates SQS queue along with corresponding "dead-letter queue" and defines `worker` function that is responsible for processing events from created SQS queue. For more details about `queue` construct type and Serverless Lift plugin in general, please refer to [docs](https://github.com/getlift/lift/blob/master/docs/queue.md). For more details about SQS processing with AWS Lambda, please refer to official [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html). 

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
Serverless: Uploading service aws-node-sqs-worker.zip file to S3 (21.45 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
................................................
Serverless: Stack update finished...
Service Information
service: aws-node-sqs-worker
stage: dev
region: us-east-1
stack: aws-node-sqs-worker-dev
resources: 17
api keys:
  None
endpoints:
  POST - https://xxxx.execute-api.us-east-1.amazonaws.com/dev/produce
functions:
  producer: aws-node-sqs-worker-dev-producer
  jobsWorker: aws-node-sqs-worker-dev-jobsWorker
layers:
  None
jobs:
  queueUrl: https://sqs.us-east-1.amazonaws.com/xxxxxx/aws-node-sqs-worker-dev-jobs
```


_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

### Invocation

After successful deployment, you can now call the created API endpoint with `POST` request to invoke `producer` function:

```bash
curl --request POST 'https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/produce' --header 'Content-Type: application/json' --data-raw '{"name": "John"}'
```

In response, you should see output similar to:

```bash
{"message": "Message accepted!"}
```
