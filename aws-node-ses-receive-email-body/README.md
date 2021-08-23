<!--
title: 'AWS SES receive emails and process body'
description: 'This example shows how to process receiving emails, and have S3 trigger a lambda function.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/aheissenberger'
authorName: 'Andreas Heissenberger'
authorAvatar: 'https://avatars2.githubusercontent.com/u/200095?v=4&s=140'
-->
# Receive an email, store in S3 bucket, trigger a lambda function

This example shows how to receive an email with SES, store the email including the body on S3 and have S3
trigger a lambda function.

## Use-cases

- Postprocess of email body.

## Setup

- [Create a SES verified Domain](https://docs.aws.amazon.com/ses/latest/DeveloperGuide/receiving-email-getting-started-verify.html) but do not setup the "Rule Set"
- Edit `serverless.yml` and choose a unique S3 bucket name but follow the [normalizing Rules](https://serverless.com/framework/docs/providers/aws/guide/resources#aws-cloudformation-resource-reference) to allow to use the name for the `bucketRef`. To keep it working use a name which  contains only the characters a-z. The `bucketRef` is the constant string `S3Bucket` plus the `bucket` name with the first letter uppercase.
- if you change the region check if SES receiving exists in your region

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
service: aws-node-ses-receive-email-body
stage: dev
region: eu-west-1
stack: aws-node-ses-receive-email-body-dev
api keys:
  None
endpoints:
  None
functions:
  postprocess: aws-node-ses-receive-email-body-dev-postprocess

```

## Setup SNS Email Receiving Rule

1) Open the Amazon SES console at https://console.aws.amazon.com/ses/
2) In the navigation pane, under Email Receiving, choose Rule Sets.
3) Choose **Create a Receipt Rule**.
4) On the Recipients page, choose **Next Step**. (Without a adding any recipients, Amazon SES applies this rule to all recipients)
5) For **Add action**, choose **S3**.
6) For **S3 bucket**,choose **Enter a bucket name** and select the bucket with the name you defined in `serverless.yml`
7) Choose **Next Step**
8) On the **Rule Details** page, for **Rule name**, type **my-rule**. Select the check box next to **Enabled**, and then choose **Next Step**.
9) On the **Review** page, choose **Create Rule**.


## Usage

Send a test email to the receipient.

You should see a new S3 object in the bucket which contains the whole email body.

After a while, the postprocess function gets triggerd by an S3 event:

```bash
serverless logs --function postprocess
```

```
START RequestId: 695a6fa8-a711e8-ab5d-0fdb1ebfe5ea Version: $LATEST
<date> <RequestId> date: 2003T18:46:47.000Z
<date> <RequestId> subject: Test Subject
<date> <RequestId> body: Hello World

<date> <RequestId> from: Tim Turbo <tim.turbo@domain.test>
<date> <RequestId> attachments: []
END RequestId: 695a6fa8-a711e8-ab5d-0fdb1ebfe5ea
REPORT RequestId: 695a6fa8-a711e8-ab5d-0fdb1ebfe5ea  Duration: 55.12 ms Billed Duration: 100 ms  Memory Size: 1024 MB    Max Memory Used: 42 MB
```
