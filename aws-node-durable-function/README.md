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

A [durable function](https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html) is a Lambda function whose handler checkpoints its progress, so one execution can pause and resume across many invocations for up to a year. When it resumes, Lambda replays the handler and returns the stored result of each completed step instead of running it again.

[`handler.mjs`](handler.mjs) wraps the handler in `withDurableExecution` from the [durable execution SDK](https://www.npmjs.com/package/@aws/durable-execution-sdk-js), runs one step, waits 10 seconds, and returns:

```js
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

## Use cases

- Order, payment and approval workflows with several steps
- Processes that wait for minutes, hours or days between steps

## Deploy

```bash
npm install
serverless deploy
```

The deploy publishes a version of the function and an alias named `durable` that points at it. Lambda runs durable functions only through a version or alias, and `serverless invoke` uses this alias by default.

## Invoke

Start an execution:

```bash
serverless invoke -f worker --type Event -d '{"orderId":"1"}'
```

The command prints the ARN of the execution it started:

```text
Durable execution started: arn:aws:lambda:us-east-1:123456789012:function:aws-node-durable-function-dev-worker:1/durable-execution/<name>/<id>
```

Add `--durable-execution-name order-1` to name the execution; a second invoke with the same name returns the existing execution instead of starting another one.

Add `--json` to get the ARN in one JSON object on stdout, for scripts:

```bash
serverless invoke -f worker --type Event -d '{"orderId":"1"}' --json
```

```json
{"statusCode":202,"qualifier":"durable","executedVersion":null,"durableExecutionArn":"arn:aws:lambda:…","functionError":null,"payload":null,"log":null}
```

A synchronous invoke (without `--type Event`) waits for the execution and prints its result. Lambda runs a durable function synchronously only when its `executionTimeout` is 900 seconds or less, so with `3600` in this example the command stops and suggests `--type Event`. See [invoking durable functions](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke#durable-functions).

## Remove

```bash
serverless remove
```
