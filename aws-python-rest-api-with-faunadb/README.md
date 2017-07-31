<!--
title: AWS Serverless REST API with FaunaDB store example in Python
description: This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Todos. FaunaDB is used to store the data.
layout: Doc
-->
# Serverless REST API

This example demonstrates how to setup a [RESTful Web Services](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services) allowing you to create, list, get, update and delete Todos. FaunaDB is used to store the data.

## Structure

This service has a separate directory for all the todo operations. For each operation exactly one file exists e.g. `todos/delete.py`. In each of these files there is exactly one function defined.

The idea behind the `todos` directory is that in case you want to create a service containing multiple resources e.g. users, notes, comments you could do so in the same service. While this is certainly possible you might consider creating a separate service for each resource. It depends on the use-case and your preference.

## Use-cases

- API for a Web Application
- API for a Mobile Application

## FaunaDB Secret

Visit https://fauna.com/serverless-cloud-sign-up to obtain a `FAUNADB_SECRET` to use in `serverless.yml`.

## Setup

With your FaunaDB Secret in hand, set it in `serverless.yml`

```yml
  environment:
    FAUNADB_SECRET: YOUR-SECRET-HERE
```

To avoid the error message `DistutilsOptionError: must supply either home or prefix/exec-prefix -- not both` first is necessary create a python virtual environment

```bash
virtualenv -p `which python` venv

source venv/bin/activate
```

In order to make it easy to package in this example we're using the node plugin `serverless-python-requirements`, so install it with

```bash
npm install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Installing required Python packages...
Serverless: Linking required Python packages...
Serverless: Packaging service...
Serverless: Unlinking required Python packages...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading service .zip file to S3 (2.33 MB)...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
......................................
Serverless: Stack update finished...
Serverless: Removing old service versions...
Service Information
service: serverless-rest-api-with-faunadb
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  POST - https://bo19b9b32h.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://bo19b9b32h.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://bo19b9b32h.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  PUT - https://bo19b9b32h.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  DELETE - https://bo19b9b32h.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
functions:
  create: serverless-rest-api-with-faunadb-dev-create
  list: serverless-rest-api-with-faunadb-dev-list
  get: serverless-rest-api-with-faunadb-dev-get
  update: serverless-rest-api-with-faunadb-dev-update
  delete: serverless-rest-api-with-faunadb-dev-delete
```

## Setup schema

Before you execute any command, first you have to setup a FaunaDB schema with the command:

```bash
serverless invoke --function schema
```

## Usage

You can create, retrieve, update, or delete todos with the following commands:

### Create a Todo

```bash
curl -X POST https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "Learn Serverless" }'
```

No output

### List all Todos

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
```

Example output:
```json
[{"text": "Deploy my first service", "id": "159546695821033477", "checked": true, "updatedAt": 1479139961304}, {"text": "Learn Serverless", "id": "159547069624745989", "createdAt": 1479139943241, "checked": false, "updatedAt": 1479139943241}]
```

### Get one Todo

```bash
# Replace the <id> part with a real id from your todos class
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id>
```

Example Result:
```json
{"text": "Learn Serverless", "id": "159547069624745989", "createdAt": 1479138570824, "checked": false, "updatedAt": 1479138570824}
```

### Update a Todo

```bash
# Replace the <id> part with a real id from your todos class
curl -X PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id> --data '{ "text": "Learn Serverless", "checked": true }'
```

Example Result:
```json
{"text": "Learn Serverless", "id": "159547069624745989", "createdAt": 1479138570824, "checked": true, "updatedAt": 1479138570824}
```

### Delete a Todo

```bash
# Replace the <id> part with a real id from your todos class
curl -X DELETE https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id>
```

No output

## Scaling

### AWS Lambda

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
