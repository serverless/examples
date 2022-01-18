<!--
title: 'AWS Serverless HTTP API with DynamoDB store example in Python'
description: 'This example demonstrates how to setup an HTTP API allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data.'
layout: Doc
framework: v1
platform: AWS
language: Python
authorLink: 'https://github.com/godfreyhobbs'
authorName: 'Godfrey Hobbs'
authorAvatar: 'https://avatars1.githubusercontent.com/u/8434141?v=4&s=140'
-->
# Serverless HTTP API

This example demonstrates how to setup an HTTP API allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. This is just an example and of course you could use any data storage as a backend.

## Structure

This service has a separate directory for all the todo operations. For each operation exactly one file exists e.g. `todos/delete.py`. In each of these files there is exactly one function defined.

The idea behind the `todos` directory is that in case you want to create a service containing multiple resources e.g. users, notes, comments you could do so in the same service. While this is certainly possible you might consider creating a separate service for each resource. It depends on the use-case and your preference.

## Use-cases

- API for a Web Application
- API for a Mobile Application

## Setup

```bash
npm install -g serverless
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service…
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
Serverless: Stack update finished…

Service Information
service: serverless-http-api-dynamodb
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos
  GET - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos
  GET - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos/{id}
  PUT - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos/{id}
  DELETE - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos/{id}
functions:
  update: serverless-http-api-dynamodb-dev-update
  get: serverless-http-api-dynamodb-dev-get
  list: serverless-http-api-dynamodb-dev-list
  create: serverless-http-api-dynamodb-dev-create
  delete: serverless-http-api-dynamodb-dev-delete
```

## Usage

You can create, retrieve, update, or delete todos with the following commands:

### Create a Todo

```bash
curl -X POST https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos --data '{ "text": "Learn Serverless" }' -H "Content-Type: application/json"
```

No output

### List all Todos

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos
```

Example output:
```bash
[{"text":"Deploy my first service","id":"ac90feaa11e6-9ede-afdfa051af86","checked":true,"updatedAt":1479139961304},{"text":"Learn Serverless","id":"206793aa11e6-9ede-afdfa051af86","createdAt":1479139943241,"checked":false,"updatedAt":1479139943241}]%
```

### Get one Todo

```bash
# Replace the <id> part with a real id from your todos table
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos/<id>
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### Update a Todo

```bash
# Replace the <id> part with a real id from your todos table
curl -X PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos/<id> --data '{ "text": "Learn Serverless", "checked": true }' -H "Content-Type: application/json"
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":true,"updatedAt":1479138570824}%
```

### Delete a Todo

```bash
# Replace the <id> part with a real id from your todos table
curl -X DELETE https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos/<id>
```

No output

## Scaling

### AWS Lambda

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 1000. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).

### DynamoDB

When you create a table, you specify how much provisioned throughput capacity you want to reserve for reads and writes. DynamoDB will reserve the necessary resources to meet your throughput needs while ensuring consistent, low-latency performance. You can change the provisioned throughput and increasing or decreasing capacity as needed.

This is can be done via settings in the `serverless.yml`.

```yaml
  ProvisionedThroughput:
    ReadCapacityUnits: 1
    WriteCapacityUnits: 1
```

In case you expect a lot of traffic fluctuation we recommend to checkout this guide on how to auto scale DynamoDB [https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/](https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/)
