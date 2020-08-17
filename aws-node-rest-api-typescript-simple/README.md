<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS with Typescript'
description: 'This template demonstrates how to make a simple REST API with Node.js and Typescript running on AWS Lambda and API Gateway using the Serverless Framework v1.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node with Typescript REST API on AWS

This template demonstrates how to make a simple REST API with Node.js and Typescript running on AWS Lambda and API Gateway using the Serverless Framework v1.

This template does not include any kind of persistence (database). For a more advanced example check out the [aws-node-rest-api-typescript example](https://github.com/serverless/examples/tree/master/aws-node-rest-api-typescript) which has must RESTful resources and persistence using MongoDB.

## Setup

Run this command to initialize a new project in a new working directory.

`sls init aws-node-rest-api-typescript`

## Usage

**Deploy**

This example is made to work with the Serverless Framework dashboard which includes advanced features like CI/CD, monitoring, metrics, etc.

```
$ serverless login
$ serverless deploy
```

To deploy without the dashboard you will need to remove `org` and `app` fields from the `serverless.yml`, and you won’t have to run `sls login` before deploying.

**Invoke the function locally.**

```
serverless invoke local --function hello
```

**Invoke the function**

```
curl https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
```
