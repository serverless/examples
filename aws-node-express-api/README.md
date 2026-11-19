<!--
title: 'Node Express API on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 2
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node Express API on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-express-api.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys an [Express](https://expressjs.com/) application to AWS Lambda behind an API Gateway HTTP API. One function receives every request, and Express routes it. Use it to run an Express API without managing servers.

## What it deploys

- An API Gateway HTTP API that sends every path and method to one function.
- A Lambda function, `api`, that runs the Express application.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the dependencies and deploy from this directory:

```bash
npm install
serverless deploy
```

You should see output like this:

```text
Deploying "aws-node-express-api" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-node-express-api-dev (47s)
endpoint: ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com

functions:
  api: aws-node-express-api-dev-api (946 kB)
```

The deploy prints the endpoint URL, `https://<api-id>.execute-api.<region>.amazonaws.com`.

## Try it

Call the root path with the URL the deploy printed:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Express answers with status 200 and this body:

```json
{"message":"Hello from root!"}
```

The `/hello` path answers `{"message":"Hello from path!"}`, and any other path answers status 404 with `{"error":"Not Found"}`.

## How it works

`serverless.yml` sends every request to the `api` function with a catch-all `httpApi` event:

```yaml
functions:
  api:
    handler: handler.handler
    events:
      - httpApi: "*"
```

`handler.js` is an ordinary Express application. The [`serverless-http`](https://github.com/dougmoscrop/serverless-http) package turns each Lambda event into a request Express understands, and Express's response back into a Lambda response:

```javascript
const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

exports.handler = serverless(app);
```

Add routes to the Express application as usual; `serverless.yml` does not change. After the deploy, the API is public and anyone can call it. To restrict access, configure an authorizer, as the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) describe.

### Develop with Dev Mode

Start a Dev Mode session:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine. Call your API as before, and your local code runs, with the function's deployed configuration and permissions. Edit the code, and the next request runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; the function runs the deployed code again. Run `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).

## Cost and cleanup

While the example is deployed, Lambda bills each request and the function's compute time, and API Gateway bills each request. While nobody calls the API, neither bills anything. The function's logs stay in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, the API and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) for routes, authorizers and CORS.
- Store data in DynamoDB with the [Express and DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-node-express-dynamodb-api).
- Compare with a single-route API in the [HTTP API example](https://github.com/serverless/examples/tree/v4/aws-node-http-api).
