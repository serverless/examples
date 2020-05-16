<!--
title: 'Serverless Nodejs Rest API with TypeScript And MongoDB Atlas'
description: 'This is simple REST API example for AWS Lambda By Serverless framwork with TypeScript and MongoDB Atlas.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/Q-Angelo'
authorName: 'May Jun'
authorAvatar: 'https://avatars0.githubusercontent.com/u/17956058?s=460&u=f3acebabd097e6e93d5be5a8366b980fea5b15aa&v=4'
-->
# Serverless Nodejs Rest API with TypeScript And MongoDB Atlas

This is simple REST API example for AWS Lambda By Serverless framwork with TypeScript and MongoDB Atlas.

## Use Cases

* REST API with typescript
* MongoDB Atlas data storage
* Multi-environment management under Serverless
* Mocha unit tests and lambda-tester interface test
* AWS lambda function log view

## Invoke the function locally

```bash
serverless invoke local --function find
```

Which should result in:

```bash
Serverless: Compiling with Typescript...
Serverless: Using local tsconfig.json
Serverless: Typescript compiled.

{
    "statusCode": 200,
    "body": "{\"code\":0,\"message\":\"success\",\"data\":[{\"_id\":\"5dff21f71c9d440000a30dad\",\"createdAt\":\"2020-05-16T09:27:51.219Z\"},{\"_id\":\"5dff22ba1c9d440000a30dae\",\"createdAt\":\"2020-05-16T09:27:51.220Z\"}]}"
}
```

## Deploy

### To Test It Locally

* Run ```npm install``` to install all the necessary dependencies.
* Run ```npm run local``` use serverless offline to test locally. 

### Deploy on AWS, simply run:

```
$ npm run deploy

# or

$ serverless deploy
```

The expected result should be similar to:

```
Serverless: Compiling with Typescript...
Serverless: Using local tsconfig.json
Serverless: Typescript compiled.
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node-rest-api-typescript.zip file to S3 (1.86 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
......................................
Serverless: Stack update finished...
Service Information
service: aws-node-rest-api-typescript
stage: dev
region: us-east-1
stack: aws-node-rest-api-typescript-dev
resources: 32
api keys:
  None
endpoints:
  POST - https://xxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/books
  PUT - https://xxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/books/{id}
  GET - https://xxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/books
  GET - https://xxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/books/{id}
  DELETE - https://xxxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/books/{id}
functions:
  create: aws-node-rest-api-typescript-dev-create
  update: aws-node-rest-api-typescript-dev-update
  find: aws-node-rest-api-typescript-dev-find
  findOne: aws-node-rest-api-typescript-dev-findOne
  deleteOne: aws-node-rest-api-typescript-dev-deleteOne
layers:
  None
Serverless: Removing old service artifacts from S3...
Serverless: Run the "serverless" command to setup monitoring, troubleshooting and testing.
```

## Usage

send an HTTP request directly to the endpoint using a tool like curl

```
curl https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/books
```

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
