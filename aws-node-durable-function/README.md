<!--
title: 'AWS Lambda durable function (NodeJS)'
description: 'Deploy a Node.js Lambda durable function that runs a checkpointed step, waits, and resumes, and start an execution with serverless invoke.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Durable function

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-durable-function.svg)](https://github.com/serverless/examples/blob/verified/results.json)

A [durable function](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html) is a Lambda function whose handler checkpoints its progress, so one execution can pause and resume across many invocations for up to a year. When it resumes, Lambda replays the handler and returns the stored result of each completed step instead of running it again. Use it for order, payment and approval workflows with several steps, and for processes that wait minutes, hours or days between steps.

## What it deploys

- A Lambda function, `worker`, with durable execution turned on.
- A published version of the function and an alias, `durable`, that points at it.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), to read an execution's result.

## Deploy

Install the dependencies and deploy from this directory:

```bash
npm ci
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-node-durable-function" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-node-durable-function-dev (47s)
functions:
  worker: aws-node-durable-function-dev-worker (3.5 MB)
```

The deploy publishes a version of the function and the `durable` alias. Lambda runs durable functions only through a version or alias, and `serverless invoke` uses this alias by default.

## Try it

Start an execution:

```bash
serverless invoke -f worker --type Event -d '{"orderId":"1"}'
```

The command prints the ARN of the execution it started:

```text
Durable execution started: arn:aws:lambda:us-east-1:123456789012:function:aws-node-durable-function-dev-worker:1/durable-execution/3ebd7f79-db03-4601-87de-68c7c4dfd267/6113b540-687c-3f6c-bc97-7482b3c95936
```

Wait about 15 seconds, since the handler waits 10, then read the execution's result with the AWS CLI:

```bash
aws lambda get-durable-execution --durable-execution-arn <the ARN the invoke printed>
```

The output, trimmed to three fields, looks like this:

```json
{
    "DurableExecutionArn": "arn:aws:lambda:us-east-1:123456789012:function:aws-node-durable-function-dev-worker:1/durable-execution/e84fa685-1505-4cf2-ab5c-eac4330fcbb5/ed84f67f-1948-3aaf-bc11-f01c76b28bfd",
    "Result": "{\"orderId\":\"2\",\"acceptedAt\":\"2026-11-19T16:23:59.253Z\",\"completedAt\":\"2026-11-19T16:24:09.410Z\"}",
    "Status": "SUCCEEDED"
}
```

`Status` is `SUCCEEDED`, and `Result` holds what the handler returned, with `completedAt` about 10 seconds after `acceptedAt`.

Add `--durable-execution-name` to name the execution:

```bash
serverless invoke -f worker --type Event -d '{"orderId":"1"}' --durable-execution-name order-1
```

A second invoke with the same name returns the existing execution instead of starting another one, so both runs print the same ARN:

```text
Durable execution started: arn:aws:lambda:us-east-1:123456789012:function:aws-node-durable-function-dev-worker:1/durable-execution/order-1/9c789fe9-8b11-304a-96d1-e16bc69454f5
```

Add `--json` to get the ARN in one JSON object on stdout, for scripts:

```bash
serverless invoke -f worker --type Event -d '{"orderId":"1"}' --json
```

```json
{"statusCode":202,"qualifier":"durable","executedVersion":null,"durableExecutionArn":"arn:aws:lambda:…","functionError":null,"payload":null,"log":null}
```

A synchronous invoke (without `--type Event`) waits for the execution and prints its result. Lambda runs a durable function synchronously only when its `executionTimeout` is 900 seconds or less, so with `3600` in this example the command stops and suggests `--type Event`:

```bash
serverless invoke -f worker -d '{"orderId":"1"}'
```

```text
✖ Function "worker" is a durable function with an execution timeout of 3600 seconds. Lambda runs a durable function synchronously only when its execution timeout is 900 seconds (15 minutes) or less. Run the same command with --type Event to start it asynchronously.
```

See [invoking durable functions](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke#durable-functions).

## How it works

[`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-durable-function/handler.mjs) wraps the handler in `withDurableExecution` from the [durable execution SDK](https://www.npmjs.com/package/@aws/durable-execution-sdk-js), runs one step, waits 10 seconds, and returns:

```javascript
export const worker = withDurableExecution(async (event, context) => {
  const order = await context.step('accept-order', async () => ({ orderId: event?.orderId ?? 'unknown', acceptedAt: new Date().toISOString() }))
  await context.wait({ seconds: 10 })
  return { ...order, completedAt: new Date().toISOString() }
})
```

The function is made durable by its `durableConfig`:

```yaml
functions:
  worker:
    handler: handler.worker
    durableConfig:
      executionTimeout: 3600
```

`executionTimeout` is the longest a whole execution may take, waits included. The Node.js runtime includes a copy of the SDK; this example pins it in `package.json` so the deployed code runs the version it was written for. See [Durable Functions](https://www.serverless.com/framework/docs/providers/aws/guide/functions#durable-functions) for the other options.

## Cost and cleanup

While the example is deployed, Lambda bills each invocation and the function's compute time, the durable operations an execution records, such as steps and waits, and the checkpoint data it keeps. No compute is billed while an execution waits. Until you remove the stack, the function's logs stay in CloudWatch Logs, which bills for stored log data. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, its versions, the alias and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read [Durable Functions](https://www.serverless.com/framework/docs/providers/aws/guide/functions#durable-functions) in the functions guide for the other `durableConfig` options.
- Start from a function with no durable execution in the [AWS Node.js example](https://github.com/serverless/examples/tree/v4/aws-node).
- Run work on a timer instead with the [scheduled cron example](https://github.com/serverless/examples/tree/v4/aws-node-scheduled-cron).
