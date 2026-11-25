<!--
title: 'AWS Step Functions state machine (NodeJS)'
description: 'Deploy a Step Functions state machine that runs two Node.js Lambda functions with a retry, a wait and a choice, and start an execution with serverless invoke stepf.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Step Functions state machine

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-step-functions.svg)](https://github.com/serverless/examples/blob/verified/results.json)

An [AWS Step Functions](https://docs.aws.amazon.com/step-functions/latest/dg/welcome.html) state machine runs a workflow that you define as states in Amazon States Language: the service calls each step, passes each step's output to the next, retries the steps that fail, and keeps the execution's state and history while it waits. This example deploys a Standard state machine that runs two Lambda functions with a 10-second wait between them, with the community plugin [serverless-step-functions](https://github.com/serverless-operations/serverless-step-functions).

## What it deploys

- Two Lambda functions, `validateOrder` and `processOrder`, with their IAM role and a CloudWatch Logs log group each.
- A Standard state machine, `order-workflow-<stage>`, that validates an order, waits 10 seconds and processes it, or rejects an order without an `orderId`.
- An IAM role for the state machine that allows it to invoke the two functions.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the dependencies, which include the plugin, and deploy from this directory:

```bash
npm ci
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-node-step-functions" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-node-step-functions-dev (74s)
functions:
  validateOrder: aws-node-step-functions-dev-validateOrder (65 kB)
  processOrder: aws-node-step-functions-dev-processOrder (65 kB)
```

## Try it

Start an execution with the plugin's `invoke stepf` command. `--name` is the state machine's key under `stepFunctions.stateMachines`, and the command waits for the execution to end:

```bash
serverless invoke stepf --name orderWorkflow --data '{"orderId":"1"}'
```

About 11 seconds later it prints the execution, here trimmed to its main fields:

```json
{
  "executionArn": "arn:aws:states:us-east-1:123456789012:execution:order-workflow-dev:f1f6dae9-2d4c-43af-a572-6f2af58bcadf",
  "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:order-workflow-dev",
  "status": "SUCCEEDED",
  "startDate": "2026-11-25T22:16:07.219Z",
  "stopDate": "2026-11-25T22:16:18.089Z",
  "input": "{\"orderId\":\"1\"}",
  "output": "{\"orderId\":\"1\",\"status\":\"processed\",\"acceptedAt\":\"2026-11-25T22:16:07.573Z\",\"completedAt\":\"2026-11-25T22:16:18.028Z\"}"
}
```

`status` is `SUCCEEDED`, and `output` holds what `processOrder` returned, with `completedAt` about 10 seconds after `acceptedAt`.

Send an order without an `orderId`:

```bash
serverless invoke stepf --name orderWorkflow --data '{}'
```

The Choice state sends it to the `Rejected` state, which ends the execution at once:

```json
{
  "status": "SUCCEEDED",
  "input": "{}",
  "output": "{\"status\":\"rejected\",\"orderId\":null}"
}
```

The execution's history lists every state it passed through. Read it with the AWS CLI, using the `executionArn` the first invoke printed:

```bash
aws stepfunctions get-execution-history --region us-east-1 --execution-arn <executionArn> --query 'events[].[id,type,stateEnteredEventDetails.name || stateExitedEventDetails.name,timestamp]' --output text
```

```text
1	ExecutionStarted	None	2026-11-25T22:16:07.219000+00:00
2	TaskStateEntered	ValidateOrder	2026-11-25T22:16:07.244000+00:00
3	LambdaFunctionScheduled	None	2026-11-25T22:16:07.244000+00:00
4	LambdaFunctionStarted	None	2026-11-25T22:16:07.311000+00:00
5	LambdaFunctionSucceeded	None	2026-11-25T22:16:07.586000+00:00
6	TaskStateExited	ValidateOrder	2026-11-25T22:16:07.597000+00:00
7	ChoiceStateEntered	IsValid	2026-11-25T22:16:07.597000+00:00
8	ChoiceStateExited	IsValid	2026-11-25T22:16:07.597000+00:00
9	WaitStateEntered	WaitTenSeconds	2026-11-25T22:16:07.597000+00:00
10	WaitStateExited	WaitTenSeconds	2026-11-25T22:16:17.645000+00:00
11	TaskStateEntered	ProcessOrder	2026-11-25T22:16:17.645000+00:00
12	LambdaFunctionScheduled	None	2026-11-25T22:16:17.645000+00:00
13	LambdaFunctionStarted	None	2026-11-25T22:16:17.700000+00:00
14	LambdaFunctionSucceeded	None	2026-11-25T22:16:18.044000+00:00
15	TaskStateExited	ProcessOrder	2026-11-25T22:16:18.061000+00:00
16	ExecutionSucceeded	None	2026-11-25T22:16:18.089000+00:00
```

The Step Functions console shows the same execution as a graph. `serverless info --verbose` prints the state machine's ARN as the stack output `OrderWorkflowArn`.

## How it works

[`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-step-functions/serverless.yml) loads the plugin and defines the state machine under `stepFunctions`:

```yaml
plugins:
  - serverless-step-functions

functions:
  validateOrder:
    handler: handler.validateOrder
  processOrder:
    handler: handler.processOrder

stepFunctions:
  stateMachines:
    orderWorkflow:
      id: OrderWorkflow
      name: order-workflow-${sls:stage}
      definition:
        StartAt: ValidateOrder
        States:
          ValidateOrder:
            Type: Task
            Resource:
              Fn::GetAtt: [validateOrder, Arn]
            Next: IsValid
          IsValid:
            Type: Choice
            Choices:
              - Variable: $.valid
                BooleanEquals: true
                Next: WaitTenSeconds
            Default: Rejected
          WaitTenSeconds:
            Type: Wait
            Seconds: 10
            Next: ProcessOrder
          ProcessOrder:
            Type: Task
            Resource:
              Fn::GetAtt: [processOrder, Arn]
            Retry:
              - ErrorEquals: [States.ALL]
                IntervalSeconds: 2
                MaxAttempts: 3
                BackoffRate: 2
            End: true
          Rejected:
            Type: Pass
            Parameters:
              orderId.$: $.orderId
              status: rejected
            End: true
```

- `definition` is the state machine in Amazon States Language, written in YAML. `Fn::GetAtt: [validateOrder, Arn]` names a function of this service by its key under `functions`.
- `ValidateOrder` and `ProcessOrder` are Task states that invoke a Lambda function. `Retry` on `ProcessOrder` runs it up to three more times, 2, 4 and 8 seconds apart, when it throws.
- `IsValid` is a Choice state: it reads `valid` from the output of `ValidateOrder` and goes to `WaitTenSeconds`, or by default to `Rejected`.
- `WaitTenSeconds` is a Wait state. The execution waits in the Step Functions service, and no function runs while it waits.
- `Rejected` is a Pass state that builds its output from its input and ends the execution.
- The plugin creates the state machine as a Standard workflow and an IAM role that allows it to invoke the two functions. `name` gives the state machine a name that carries the stage, and `id` fixes its CloudFormation logical ID, so the stack output is `OrderWorkflowArn` on every stage.

The two functions in [`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-step-functions/handler.mjs) receive the state's input and return the next state's input:

```javascript
export const validateOrder = async (event) => ({
  orderId: event?.orderId ?? null,
  valid: typeof event?.orderId === 'string' && event.orderId.length > 0,
  acceptedAt: new Date().toISOString(),
})

export const processOrder = async (order) => ({
  orderId: order.orderId,
  status: 'processed',
  acceptedAt: order.acceptedAt,
  completedAt: new Date().toISOString(),
})
```

The plugin is pinned to an exact version in [`package.json`](https://github.com/serverless/examples/blob/v4/aws-node-step-functions/package.json), as a development dependency: it runs in the CLI at deploy time and is not packaged with the functions.

## Cost and cleanup

While the example is deployed, Step Functions bills Standard workflows for each state transition of an execution, retries included, and Lambda bills each invocation of the two functions and their compute time. A Wait state is billed as one transition, however long it waits. Until you remove the stack, the functions' logs stay in CloudWatch Logs, which bills for stored log data. See [Step Functions pricing](https://aws.amazon.com/step-functions/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the state machine, the functions, the roles and the log groups, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [serverless-step-functions README](https://github.com/serverless-operations/serverless-step-functions#readme) for Express workflows, events that start an execution, logging and the plugin's other options.
- Read the [Amazon States Language](https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html) reference for the other state types and fields.
- Write the same workflow as a function's code instead with the [durable function example](https://github.com/serverless/examples/tree/v4/aws-node-durable-function).
