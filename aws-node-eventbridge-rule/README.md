<!--
title: 'Node EventBridge Rule on AWS'
description: 'This example shows how an Amazon EventBridge rule on the default event bus invokes a Lambda function only for the events that match its content filter.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Trigger a Lambda function from an EventBridge rule

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-eventbridge-rule.svg)](https://github.com/serverless/examples/blob/verified/results.json)

A Lambda function can react to events on an Amazon EventBridge event bus without polling and without knowing who publishes them. The [`eventBridge` event](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge) of the Serverless Framework creates a rule on the account's default event bus with an event pattern, and EventBridge invokes the function only for the events that match it. This example's pattern matches `OrderPlaced` events from the source `orders.app` whose `total` is 100 or more: an order of 250 reaches the function, an order of 40 doesn't.

## What it deploys

- A Lambda function, `orderPlaced`, that logs each order it receives.
- An EventBridge rule on the default event bus with the example's event pattern, the function as its target, and a Lambda permission that lets EventBridge invoke the function.
- An IAM role that lets the function write its logs, and a CloudWatch Logs log group for the function.

The example uses the default event bus, which exists in every account and Region, so it deploys no bus.

## Prerequisites

- The Serverless Framework CLI: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), to publish events. The commands in Try it are written for Bash.

## Deploy

Deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`. Pass the same Region to the AWS CLI in Try it.

You should see output like this:

```text
Deploying "eventbridge-rule" to stage "dev" (us-east-1)
✔ Service deployed to stack eventbridge-rule-dev (104s)
functions:
  orderPlaced: eventbridge-rule-dev-orderPlaced (5.7 kB)
```

## Try it

Publish two orders to the default event bus, one with a total of 250 and one with a total of 40:

```bash
aws events put-events --region us-east-1 --entries '[
  {"Source": "orders.app", "DetailType": "OrderPlaced", "Detail": "{\"orderId\": \"o-1001\", \"total\": 250}"},
  {"Source": "orders.app", "DetailType": "OrderPlaced", "Detail": "{\"orderId\": \"o-1002\", \"total\": 40}"}
]'
```

EventBridge accepts both and returns an ID for each:

```json
{
    "FailedEntryCount": 0,
    "Entries": [
        {
            "EventId": "6d97f2af-9a63-4249-d5f6-b3123538ec71"
        },
        {
            "EventId": "4fd5e5f0-58d4-1f54-08ae-d7271cc83a56"
        }
    ]
}
```

Read the function's log:

```bash
serverless logs --function orderPlaced
```

Among Lambda's own `START`, `END` and `REPORT` lines, the function's line names only the first order:

```text
INFO	Order o-1001 placed: total 250, event 6d97f2af-9a63-4249-d5f6-b3123538ec71
```

The order of 40 doesn't match the pattern, so EventBridge didn't invoke the function for it. If the command prints `No existing streams for the function`, or the line isn't there yet, wait a few seconds and run it again.

## How it works

The `eventBridge` event in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-eventbridge-rule/serverless.yml) has no `eventBus`, so the Framework creates the rule on the default event bus. Its `pattern` becomes the rule's event pattern: an event matches when its `source`, its `detail-type` and the `total` in its `detail` all match. `numeric` compares numbers; EventBridge patterns also match exact values, prefixes, `anything-but` lists and more ([event patterns](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-event-patterns.html)):

```yaml
functions:
  orderPlaced:
    handler: handler.orderPlaced
    events:
      - eventBridge:
          pattern:
            source:
              - orders.app
            detail-type:
              - OrderPlaced
            detail:
              total:
                - numeric: ['>=', 100]
```

The Framework also adds the Lambda permission that lets EventBridge invoke the function, limited to the rule's ARN. The function needs no IAM permission to receive events.

EventBridge invokes the function asynchronously with one event per invocation. The event's own fields (`id`, `source`, `detail-type`, `time`) surround the payload in `detail`. [`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-eventbridge-rule/handler.mjs) logs the order from `detail` and the event's ID:

```javascript
export const orderPlaced = async (event) => {
  const { orderId, total } = event.detail;
  console.log(`Order ${orderId} placed: total ${total}, event ${event.id}`);
};
```

Every rule on the default bus sees every event published to it, so other consumers add their own rules for the same events without a change to the publisher. AWS services publish their events to the default bus too: a pattern with `source: [aws.s3]` or `source: [aws.ec2]` invokes a function for S3 or EC2 events in the same way.

## Cost and cleanup

While the example is deployed, Amazon EventBridge bills each custom event published to the bus, Lambda bills each invocation and the function's compute time, and CloudWatch Logs bills the function's stored log data. See [Amazon EventBridge pricing](https://aws.amazon.com/eventbridge/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).

Remove the rule, the function, its IAM role and its log group:

```bash
serverless remove
```

The default event bus stays, as it does in every account.

## Next steps

- Read [EventBridge events](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge) for rules on other buses, schedules, input transformation, retry policies and dead-letter queues.
- Subscribe functions to a Custom Event Bus, with ordered and batched delivery, as the [compose-eventbridge-custom-bus example](https://github.com/serverless/examples/tree/v4/compose-eventbridge-custom-bus) does.
- Process each event once, with retries and a dead-letter queue, as the [SQS worker example](https://github.com/serverless/examples/tree/v4/aws-node-sqs-worker) does.
