<!--
title: AWS Stripe Integration example in NodeJS
description: This example for Stripe integration using AWS Lambda and API Gateway.
layout: Doc
-->
# Stripe Integration Example

This example for Stripe integration using AWS Lambda and API Gateway.

## Use Cases

- Notified about events that happen in a Stripe account.

## Setup

### Install npm packages
```bash
$ npm install
```

### Edit config overrides for production deployment
```bash
$ vi config/local.yaml
```

```yaml
stripe:
    test_sk: 'Stripe_Test_Secret_Key_here'
    live_sk: 'Stripe_Live_Secret_Key_here'
```

### Deploy!
```bash:development
$ serverless deploy -v
```

or production
```bash:production
$ serverless deploy -v --stage live
```

```
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (2.15 MB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.....
Serverless: Stack update finished...
Serverless: Removing old service versions...
Service Information
service: aws-node-stripe-integration
stage: development
region: us-east-1
api keys:
  None
endpoints:
  POST - https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/test/stripe/incoming
functions:
  incoming: aws-node-stripe-integration-test-incoming

Stack Outputs
ServiceEndpoint: https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/test
ServerlessDeploymentBucketName: aws-node-stripe-integration-serverlessdeploymentbuck-xxxxxxxxxxxx
IncomingLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:000000000000:function:aws-node-stripe-integration-test-incoming:20
```