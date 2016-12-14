# Serverless Environment Variables Usage

This example demonstrates how to setup your own Alexa skill using AWS Lambdas.

## Use-cases

- Building custom Alexa skills

## How it works

In the Alexa Developer Portal you can add you own skill. To do so you need to define the available intents and then connect them to a AWS Lambda. The Lambda you can define and update with Serverless.

## Setup

TODO go through the steps

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (378 B)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.........
Serverless: Stack update finished...
Serverless: Removing old service versions...
Service Information
service: aws-node-alexa-skill-2
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  aws-node-alexa-skill-2-dev-luckyNumber: arn:aws:lambda:us-east-1:377024778620:function:aws-node-alexa-skill-2-dev-luckyNumber

```

## Usage
