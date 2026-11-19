<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node HTTP API on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-http-api.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys an HTTP API on AWS Lambda and API Gateway with Node.js. One `GET /` endpoint returns a JSON message. Start here when you want an HTTP endpoint and no database.

## What it deploys

- An API Gateway HTTP API with one route, `GET /`.
- A Lambda function, `hello`, that answers the route.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Run the deploy from this directory:

```bash
serverless deploy
```

The deploy prints the endpoint URL, `https://<api-id>.execute-api.<region>.amazonaws.com/`.

## Try it

Call the endpoint with the URL the deploy printed:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
```

The function answers with status 200 and this body:

```json
{"message":"Go Serverless v4! Your function executed successfully!"}
```

## How it works

`serverless.yml` declares one function and connects it to the HTTP API with an `httpApi` event:

```yaml
functions:
  hello:
    handler: handler.hello
    events:
      - httpApi:
          path: /
          method: get
```

`handler.js` returns the status code and a JSON body:

```javascript
exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Go Serverless v4! Your function executed successfully!",
    }),
  };
};
```

After the deploy, the API is public and anyone can call it. To restrict access, configure an authorizer, as the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) describe. To serve the API on your own domain, uncomment `domain` in `serverless.yml` and read the [custom domains guide](https://www.serverless.com/framework/docs/providers/aws/guide/domains).

### Develop with Dev Mode

Start a Dev Mode session:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine. Call the endpoint as before, and your local code runs, with the function's deployed configuration and permissions. Edit the code, and the next request runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; the function runs the deployed code again. Run `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).

## Cost and cleanup

While the example is deployed, Lambda bills each request and the function's compute time, and API Gateway bills each request. While nobody calls the API, neither bills anything. The function's logs stay in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, the API and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) for routes, authorizers and CORS.
- Route many paths through one function with [Express](https://github.com/serverless/examples/tree/v4/aws-node-express-api).
- Store data in DynamoDB with the [Express and DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-node-express-dynamodb-api).
