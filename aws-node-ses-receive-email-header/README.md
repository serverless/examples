<!--
title: 'AWS SES receive an email, trigger a lambda function to process header.'
description: 'This example shows how to process receiving email header, and trigger a lambda function.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/aheissenberger'
authorName: 'Andreas Heissenberger'
authorAvatar: 'https://avatars0.githubusercontent.com/u/200095?v=4&s=140'
-->
# Receive an email, trigger a lambda function to process header

This example shows how to receive an email header with SES, trigger a lambda function, process headers or accept or reject emails.

## Use-cases

- Postprocess of email header.
- accept or reject emails

## Setup

- [Create a SES verified Domain](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-getting-started-verify.html) but do not setup the "Rule Set"
- if you change the region check if SES receiving exists in your region
- if you change the function names you will need to update the normalized function name used in the resource section - e.g. processacceptreject => ProcessacceptrejectLambdaFunction

## Deploy

In order to deploy the example, simply run:

```bash
serverless deploy
```

The output should look similar to:

```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (2.69 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
........................
Serverless: Stack update finished...
Service Information
service: aws-node-ses-receive-email-header
stage: dev
region: eu-west-1
stack: aws-node-ses-receive-email-header-dev
api keys:
  None
endpoints:
  None
functions:
  processheader: aws-node-ses-receive-email-header-dev-processheader

```

## Setup SNS Email Receiving Rule for process header

1) Open the Amazon SES console at https://console.aws.amazon.com/ses/
2) In the navigation pane, under Email Receiving, choose Rule Sets.
3) Choose **Create a Receipt Rule**.
4) On the Recipients page, choose **Next Step**. (Without a adding any recipients, Amazon SES applies this rule to all recipients)
5) For **Add action**, choose **lambda**.
6) For **Lambda function**, choose the lambda function with the name **aws-node-ses-receive-email-header-dev-processheader** you defined in `serverless.yml`
6) **Invocation type** choose **Event**
7) Choose **Next Step**
8) On the **Rule Details** page, for **Rule name**, type **my-rule**. Select the check box next to **Enabled**, and then choose **Next Step**.
9) On the **Review** page, choose **Create Rule**.

## Setup SNS Email Receiving Rule for accept or reject emails

Schritte 1-5 sind identisch dann:

6) For **Lambda function**, choose the lambda function with the name **aws-node-ses-receive-email-header-dev-processacceptreject** you defined in `serverless.yml`
6) **Invocation type** choose **RequestResponse** (Lambda function will be called synchronously to control mail flow)
7) Choose **Next Step**
8) On the **Rule Details** page, for **Rule name**, type **my-rule**. Select the check box next to **Enabled**, and then choose **Next Step**.
9) On the **Review** page, choose **Create Rule**.



## Usage

Send a test email to the receipient.


```
serverless logs -t --function processheader
```

```
START RequestId: eada06fc-c76a-11a8-bffd389a883292 Version: $LATEST
<date> <RequestId>     { from: 'Tim Turbo <tim.turbo@domain.test>',
  to: 'ses-in@domain.test',
  subject: 'Testsubject',
  date: 'Thu, 4 Oct 2018 01:33:06 +0200' }
END RequestId: eada06fc-c76a-11a8-bffd389a883292
REPORT RequestId: eada06fc-c76a-11a8-bffd389a883292  Duration: 5.62 ms       Billed Duration: 100 ms         Memory Size: 1024 MB    Max Memory Used: 19 MB
```
