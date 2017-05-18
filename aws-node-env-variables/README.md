<!--
title: AWS Serverless Environment Variables Usage example in NodeJS
description: This example demonstrates how to use environment variables for AWS Lambdas.
layout: Doc
-->
# Serverless Environment Variables Usage

This example demonstrates how to use environment variables for AWS Lambdas.

## Use-cases

- Provide settings as environment variables to your Lambda functions

## How it works

The first time you create or update Lambda functions that use environment variables in a region, a default service key is created for you automatically within AWS KMS. This key is used to encrypt environment variables.

When you create or update Lambda functions that use environment variables, AWS Lambda encrypts them using the AWS Key Management Service. When your Lambda function is invoked, those values are decrypted and made available to the Lambda code. Read more in the official AWS [docs](http://docs.aws.amazon.com/lambda/latest/dg/env_variables.html).

## Setup

None needed.

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Creating Stack…
Serverless: Checking Stack create progress…
.....
Serverless: Stack create finished…
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
................
Serverless: Stack update finished…

Service Information
service: function-with-environment-variables
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  function-with-environment-variables-dev-resetPassword: arn:aws:lambda:us-east-1:377024778620:function:function-with-environment-variables-dev-resetPassword
  function-with-environment-variables-dev-createUser: arn:aws:lambda:us-east-1:377024778620:function:function-with-environment-variables-dev-createUser
```

## Usage

You can now invoke each of the Lambdas directly and print their log statements via

```bash
serverless invoke --function=createUser --log
```

The expected result should be similar to:

```bash
{
    "statusCode": 200,
    "body": "{\"message\":\"User created\"}"
}
--------------------------------------------------------------------
START RequestId: 78b0785d-afd3-11e6-8582-a7abb1cd48ef Version: $LATEST
2016-11-21 11:15:48.575 (+01:00)	78b0785d-afd3-11e6-8582-a7abb1cd48ef	PASSWORD_ITERATIONS:  4096
2016-11-21 11:15:48.576 (+01:00)	78b0785d-afd3-11e6-8582-a7abb1cd48ef	PASSWORD_DERIVED_KEY_LENGTH:  256
2016-11-21 11:15:48.576 (+01:00)	78b0785d-afd3-11e6-8582-a7abb1cd48ef	EMAIL_SERVICE_API_KEY:  KEYEXAMPLE1234
END RequestId: 78b0785d-afd3-11e6-8582-a7abb1cd48ef
REPORT RequestId: 78b0785d-afd3-11e6-8582-a7abb1cd48ef	Duration: 3.36 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

```bash
serverless invoke --function=resetPassword --log
```

The expected result should be similar to:

```bash
{
    "statusCode": 200,
    "body": "{\"message\":\"Password sent.\"}"
}
--------------------------------------------------------------------
START RequestId: 9cc33d72-afd3-11e6-b918-19a4e146bf3d Version: $LATEST
2016-11-21 11:16:48.838 (+01:00)	9cc33d72-afd3-11e6-b918-19a4e146bf3d	EMAIL_SERVICE_API_KEY:  KEYEXAMPLE1234
END RequestId: 9cc33d72-afd3-11e6-b918-19a4e146bf3d
REPORT RequestId: 9cc33d72-afd3-11e6-b918-19a4e146bf3d	Duration: 3.14 ms	Billed Duration: 100 ms 	Memory Size: 1024 MB	Max Memory Used: 15 MB
```

Especially helpful for local development you can also invoke the Lambda locally and see the resulting log via

```bash
serverless invoke local --function=createUser --log
```

The expected result should be similar to:

```bash
PASSWORD_ITERATIONS:  4096
PASSWORD_DERIVED_KEY_LENGTH:  256
EMAIL_SERVICE_API_KEY:  KEYEXAMPLE1234
{
    "statusCode": 200,
    "body": "{\"message\":\"User created\"}"
}
```
