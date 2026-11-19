<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a simple NodeJS function running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 5
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework AWS NodeJS Example

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys one Node.js function to AWS Lambda. The function has no events and no database, so it is the smallest service you can deploy and invoke. Start here to learn the deploy and invoke loop, then add the [events](https://www.serverless.com/framework/docs/providers/aws/events/) your use case needs.

## What it deploys

- A Lambda function, `hello`.
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

## Try it

Invoke the deployed function:

```bash
serverless invoke --function hello
```

The command prints the function's response:

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"Go Serverless v4.0! Your function executed successfully!\"}"
}
```

## How it works

`serverless.yml` declares the function and its runtime:

```yaml
provider:
  name: aws
  runtime: nodejs24.x
  architecture: arm64

functions:
  hello:
    handler: handler.hello
```

`handler.hello` points at the `hello` export of `handler.js`, which returns a status code and a JSON body:

```javascript
exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v4.0! Your function executed successfully!'
    })
  };
};
```

### Develop with Dev Mode

Start a Dev Mode session:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine. Invoke the function as before, and your local code runs, with the function's deployed configuration and permissions. Edit the code, and the next invocation runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; the function runs the deployed code again. Run `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).

## Cost and cleanup

Lambda charges per request and for compute time. The function costs nothing while you do not invoke it, and light use stays within the AWS free tier. Remove the stack, with the function and its log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [functions guide](https://www.serverless.com/framework/docs/providers/aws/guide/functions) for memory, timeouts and environment variables.
- Put the function behind an HTTP endpoint with the [HTTP API example](https://github.com/serverless/examples/tree/v4/aws-node-http-api).
- Run it on a schedule with the [scheduled cron example](https://github.com/serverless/examples/tree/v4/aws-node-scheduled-cron).
