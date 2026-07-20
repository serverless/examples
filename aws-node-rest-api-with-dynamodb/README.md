<!--
title: 'AWS Serverless REST API example in NodeJS'
description: 'This example demonstrates how to setup a RESTful Web Service allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/ozbillwang'
authorName: 'Bill Wang'
authorAvatar: 'https://avatars3.githubusercontent.com/u/8954908?v=4&s=140'
-->
# Serverless REST API

This example demonstrates how to setup a [RESTful Web Services](https://en.wikipedia.org/wiki/Representational_state_transfer#Applied_to_web_services) allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. This is just an example and of course you could use any data storage as a backend.

## Structure

This service has a separate directory for all the todo operations. For each operation exactly one file exists e.g. `todos/delete.js`. In each of these files there is exactly one function which is directly exported.

The idea behind the `todos` directory is that in case you want to create a service containing multiple resources e.g. users, notes, comments you could do so in the same service. While this is certainly possible you might consider creating a separate service for each resource. It depends on the use-case and your preference.

## Use-cases

- API for a Web Application
- API for a Mobile Application

## Setup

```bash
npm install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```
Deploying "serverless-rest-api-with-dynamodb" to stage "dev" (us-east-1)

✔ Service deployed to stack serverless-rest-api-with-dynamodb-dev (91s)

endpoints:
  POST - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos
  GET - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos
  GET - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos/{id}
  PUT - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos/{id}
  DELETE - https://45wf34z5yf.execute-api.us-east-1.amazonaws.com/todos/{id}
functions:
  create: serverless-rest-api-with-dynamodb-dev-create (1.2 kB)
  list: serverless-rest-api-with-dynamodb-dev-list (1.2 kB)
  get: serverless-rest-api-with-dynamodb-dev-get (1.2 kB)
  update: serverless-rest-api-with-dynamodb-dev-update (1.2 kB)
  delete: serverless-rest-api-with-dynamodb-dev-delete (1.2 kB)
```

## Usage

You can create, retrieve, update, or delete todos with the following commands:

### Create a Todo

```bash
curl -X POST https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos --data '{ "text": "Learn Serverless" }'
```

Example Result:
```bash
{"id":"3ac1f668-8b45-4b1a-9c1e-1e2f6f9d8c2a","text":"Learn Serverless","checked":false,"createdAt":1479138570824,"updatedAt":1479138570824}
```

### List all Todos

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos
```

Example output:
```bash
[{"text":"Deploy my first service","id":"ac90feaa11e6-9ede-afdfa051af86","checked":true,"updatedAt":1479139961304},{"text":"Learn Serverless","id":"206793aa11e6-9ede-afdfa051af86","createdAt":1479139943241,"checked":false,"updatedAt":1479139943241}]
```

### Get one Todo

```bash
# Replace the <id> part with a real id from your todos table
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos/<id>
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}
```

### Update a Todo

```bash
# Replace the <id> part with a real id from your todos table
curl -X PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/todos/<id> --data '{ "text": "Learn Serverless", "checked": true }'
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":true,"updatedAt":1479138570824}
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

This table is created with `BillingMode: PAY_PER_REQUEST`, so you don't need to manage read/write capacity units — DynamoDB scales automatically with your traffic and you only pay for what you use.
