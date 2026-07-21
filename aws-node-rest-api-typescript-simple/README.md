<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS with Typescript'
description: 'This template demonstrates how to make a simple REST API with Node.js and Typescript running on AWS Lambda and API Gateway using the Serverless Framework v4.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node with Typescript REST API on AWS

> Note: TypeScript is intentionally held at `5.x` — the TypeScript 7 native compiler isn't yet
> supported by the surrounding ecosystem tooling (checked 2026-07-20).

This template demonstrates how to make a simple REST API with Node.js and Typescript running on AWS Lambda and API Gateway using the Serverless Framework v4.

This template does not include any kind of persistence (database). For a more advanced example check out the [aws-node-rest-api-typescript example](https://github.com/serverless/examples/tree/v4/aws-node-rest-api-typescript) which has must RESTful resources and persistence using MongoDB.

## Setup

Run this command to initialize a new project in a new working directory.

```
npm install
```

## Usage

**Deploy**

```
$ serverless deploy
```

**Invoke the function locally.**

```
serverless invoke local --function hello
```

**Invoke the function**

```
curl https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
```
