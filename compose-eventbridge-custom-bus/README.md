<!--
title: 'Serverless Compose EventBridge Custom Event Bus Subscribers'
description: 'Own an EventBridge Custom Event Bus in a stateful service and subscribe functions from other services to it, with ordered and batched delivery, wired together with Serverless Compose'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Subscribe functions to an EventBridge Custom Event Bus with Serverless Compose

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/compose-eventbridge-custom-bus.svg)](https://github.com/serverless/examples/blob/verified/results.json)

The EventBridge [Custom Event Bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus.html) routes events to subscribers and keeps every event for a retention period of 1 to 365 days. Consumers attach their own subscribers to a bus that another stack owns, and each subscriber filters the events and delivers the matching ones to one target. When the `eventBus` of an [`eventBridge` event](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#custom-event-bus) is a Custom Event Bus, the Serverless Framework creates an `AWS::EventsV2::Subscriber` for the function instead of a rule. This example owns the bus in one service and subscribes two functions from another service to it, wired together with [Serverless Compose](https://www.serverless.com/framework/docs/guides/compose): one function receives orders one at a time in publish order, the other in batches.

```text
   ┌──────────────┐  PutEvents   ┌──────────────────────┐  subscribers  ┌──────────────────────┐
   │   producer   │ ───────────▶ │        events        │ ────────────▶ │        orders        │
   │   publish    │              │  bus orders-<stage>  │               │ fulfil: fifo, 1 event│
   └──────────────┘              │  7-day retention     │               │ audit: array + DLQ   │
                                 └──────────────────────┘               └──────────────────────┘
           ▲                                │                                      ▲
           └──────────── ${service:events.OrdersBusArn} (Compose params) ─────────┘
```

## What it deploys

Three services, which Compose deploys in this order:

- **`events`**: a stateful, resource-only service with the Custom Event Bus `orders-<stage>`, which keeps events for 7 days, and a stack output with its ARN. Deploy it once per environment.
- **`orders`**: two consumers of the bus.
  - `fulfil` receives one `OrderPlaced` event per invocation, in publish order within each event group (`ordering: fifo`, `batchSize: 1`).
  - `audit` keeps the Custom Event Bus defaults: it receives an array of events, and events it can't take go to an SQS dead-letter queue, `AuditDlq`.
  - A subscriber on the bus for each function, and one IAM delivery role that EventBridge assumes to invoke them.
- **`producer`**: a function, `publish`, that publishes order events with `@aws-sdk/client-eventbridgev2`.

Each function gets an IAM execution role and a CloudWatch Logs log group.

## Prerequisites

- The Serverless Framework CLI: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- An AWS Region that offers the Custom Event Bus. It launched in a subset of Regions; [AWS Capabilities by Region](https://builder.aws.com/build/capabilities) lists where it is available. The default quota is 5 Custom Event Buses per account and Region, so the account needs one free.
- The deploying identity needs `iam:PassRole` on the delivery role; see [The delivery role](#the-delivery-role).

## Deploy

Install the producer's dependencies, then deploy all three services from this directory:

```bash
cd producer && npm ci && cd ..
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`. Compose deploys `events` first, then `orders` and `producer`.

You should see output like this:

```text
Serverless ϟ Compose

✔ events
    OrdersBusArn: arn:aws:events:us-east-1:123456789012:event-busv2/orders-dev/buy4dk6nb4f40wofzbygbi3fm
    ServerlessDeploymentBucketName: serverless-framework-deployments-us-east-1-xxxxxxxx-xxxx

✔ producer
    PublishLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:compose-eventbus-producer-dev-publish:1
    ServerlessDeploymentBucketName: serverless-framework-deployments-us-east-1-xxxxxxxx-xxxx

✔ orders
    AuditLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:compose-eventbus-orders-dev-audit:1
    FulfilLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:compose-eventbus-orders-dev-fulfil:1
    ServerlessDeploymentBucketName: serverless-framework-deployments-us-east-1-xxxxxxxx-xxxx

Results: 3 services succeeded, 0 failed, 0 skipped, 3 total    Time: 1m 59s
```

## Try it

Invoke the producer. It publishes `count` `OrderPlaced` events (1 to 10, default 3) for one customer, one after another, and returns their sequence numbers:

```bash
serverless producer invoke --function publish --data '{"count":5}'
```

```json
{
    "customerId": "customer-c86f74c2",
    "published": [
        {
            "sequence": 1,
            "orderId": "df3fb693-4d15-4bd3-b55b-a7de18c2e3b0",
            "eventId": "6a8f5c0a-93da-4cc3-890d-059d289f693b"
        },
        ...
        {
            "sequence": 5,
            "orderId": "aa25fe11-dff6-4cce-a3fe-ac1559ea4a12",
            "eventId": "4e03564d-d9b4-4b56-be83-142dc119899e"
        }
    ]
}
```

Read `fulfil`'s log. It logs one event per invocation, with `sequence` in publish order:

```bash
serverless orders logs --function fulfil
```

Among Lambda's own `START`, `END` and `REPORT` lines, the handler's lines are:

```text
INFO	{"handler":"fulfil","orderId":"df3fb693-4d15-4bd3-b55b-a7de18c2e3b0","sequence":1,"id":"462b26d6-186a-41d1-b709-eeeac8ced30e"}
INFO	{"handler":"fulfil","orderId":"ff8529b0-cb2a-4ffa-8322-d5c6366d3024","sequence":2,"id":"cfe935e4-ebb9-40aa-8c10-fe602a353274"}
INFO	{"handler":"fulfil","orderId":"3286fe6f-0de1-4082-90ec-bd6f30d1a480","sequence":3,"id":"d2e63ed3-62d8-48e0-95f6-45a099595c63"}
INFO	{"handler":"fulfil","orderId":"fed2742b-5e5d-4f0d-a205-0bb998d298b6","sequence":4,"id":"d231158a-6609-49d5-a145-71165a3a2140"}
INFO	{"handler":"fulfil","orderId":"aa25fe11-dff6-4cce-a3fe-ac1559ea4a12","sequence":5,"id":"1937d9e1-22b0-4475-804c-ea9a65fd30d3"}
```

Read `audit`'s log. It logs the size of each array it receives; how the five events are split into batches, and in what order, varies from run to run:

```bash
serverless orders logs --function audit
```

```text
INFO	{"handler":"audit","received":4,"orders":["ff8529b0-cb2a-4ffa-8322-d5c6366d3024","fed2742b-5e5d-4f0d-a205-0bb998d298b6","aa25fe11-dff6-4cce-a3fe-ac1559ea4a12","3286fe6f-0de1-4082-90ec-bd6f30d1a480"]}
INFO	{"handler":"audit","received":1,"orders":["df3fb693-4d15-4bd3-b55b-a7de18c2e3b0"]}
```

If a command prints `No existing streams for the function`, or not all lines are there yet, wait a few seconds and run it again.

## How it works

### How the services are wired

The bus lives in its own service, so the consumers and the producer can be
deployed, changed and removed without touching it:

```yaml
# events/serverless.yml
resources:
  Resources:
    OrdersBus:
      Type: AWS::EventsV2::EventBus
      Properties:
        Name: orders-${sls:stage}
        StorageConfiguration:
          RetentionPeriodInDays: 7
  Outputs:
    OrdersBusArn:
      Value: !GetAtt OrdersBus.EventBusArn
```

`serverless-compose.yml` passes the bus ARN to the other two services. The
`service` resolver reads the output of `events` in the stage of the current run
and makes `events` deploy first:

```yaml
# serverless-compose.yml
services:
  events:
    path: events
  orders:
    path: orders
    params:
      ordersBusArn: ${service:events.OrdersBusArn}
  producer:
    path: producer
    params:
      ordersBusArn: ${service:events.OrdersBusArn}
```

The Framework recognizes a Custom Event Bus from its ARN, which contains
`:event-busv2/`. A Framework variable such as `${param:ordersBusArn}` resolves
before packaging, so each `eventBridge` event below creates a subscriber.

### The consumers

```yaml
# orders/serverless.yml
functions:
  fulfil:
    handler: handler.fulfil
    events:
      - eventBridge:
          eventBus: ${param:ordersBusArn}
          ordering: fifo
          batchSize: 1
          pattern:
            source:
              - orders.producer
            detail-type:
              - OrderPlaced

  audit:
    handler: handler.audit
    events:
      - eventBridge:
          eventBus: ${param:ordersBusArn}
          deadLetterQueueArn: !GetAtt AuditDlq.Arn
          pattern:
            source:
              - orders.producer
```

`pattern` becomes the subscriber's filter, in the same syntax as a rule's event
pattern.

#### `fulfil`: one event at a time, in order

With `ordering: fifo`, EventBridge delivers the events of each event group in
the order they were published. The producer sets the event group with
`SystemMetadata.EventGroupId`. A FIFO subscriber invokes the function
synchronously and waits for it before it delivers the next event, so the
function timeout must be 30 seconds or less. `batchSize: 1` makes the function
receive one event object rather than an array:

```js
export const fulfil = async (event) => {
  const { orderId, sequence } = event.detail;
  // ...
};
```

For a FIFO subscriber, use an SQS FIFO queue as its dead-letter queue. `fulfil`
has none, so an event that is still undeliverable after the retry policy is
dropped.

#### `audit`: the Custom Event Bus defaults

`audit` sets no delivery options, so it gets the Custom Event Bus defaults:

| Behaviour                      | Default                                                                   | Classic behaviour, and the setting that restores it                                                 |
| ------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| What the handler receives      | An array of up to 10 events, even for one event                           | One event object: `batchSize: 1`                                                                    |
| How the function is invoked    | Synchronously; a function error is a failed delivery, and is retried      | Asynchronously, with Lambda's own retries: `async: true`                                            |
| How long a delivery is retried | 300 seconds, 5 attempts, then the dead-letter queue                       | 24 hours, 185 attempts: `retryPolicy` with `maximumEventAge: 86400` and `maximumRetryAttempts: 185` |
| What re-enabling delivers      | The backlog published while the subscriber was stopped (`enabled: false`) | Only new events: `resumePosition: latest`                                                           |
| Ordering                       | Unordered                                                                 | Unordered                                                                                           |

The handler iterates over the array:

```js
export const audit = async (events) => {
  const orderIds = events.map((event) => event.detail.orderId);
  // ...
};
```

See
[Restoring Classic behaviour](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#restoring-classic-behaviour)
for moving a consumer from a Classic bus, and
[Settings on a Custom Event Bus](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#settings-on-a-custom-event-bus)
for every key, including `maximumBatchingWindow`.

### The delivery role

A subscriber invokes its function through an IAM role, not a Lambda
permission. For `orders`, the Framework creates one delivery role,
`compose-eventbus-orders-<stage>-<region>-eventBridge`, which trusts
`events.amazonaws.com` for the subscribers of the deploying account and
Region. Its policy grants `lambda:InvokeFunction` on `fulfil` and `audit`, and
`sqs:SendMessage` on `AuditDlq`.

The identity that deploys `orders` passes this role to EventBridge, so it needs
`iam:PassRole` on it, along with the IAM actions to create and delete a role.
Grant `iam:PassRole` on the delivery role only to that identity, and only for
EventBridge:

```json
{
  "Effect": "Allow",
  "Action": "iam:PassRole",
  "Resource": "arn:aws:iam::111122223333:role/compose-eventbus-orders-dev-us-east-1-eventBridge",
  "Condition": {
    "StringEquals": { "iam:PassedToService": "events.amazonaws.com" }
  }
}
```

To use a role you manage instead, set `role` on the `eventBridge` event. See
[The delivery role](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#the-delivery-role).

### The producer

The producer publishes with `PutEventsCommand` from
`@aws-sdk/client-eventbridgev2`, and its execution role allows
`events:PutEvents` on the bus:

```js
await client.send(
  new PutEventsCommand({
    EventBusArn: ORDERS_BUS_ARN,
    Entries: [
      {
        Source: 'orders.producer',
        DetailType: 'OrderPlaced',
        Detail: JSON.stringify({ orderId, customerId, sequence }),
        SystemMetadata: { EventGroupId: customerId },
      },
    ],
  }),
);
```

The Framework's built-in esbuild build leaves every `@aws-sdk/*` package out of
the bundle by default and relies on the SDK in the Lambda Node.js runtime.
Which clients that SDK includes, and at which version, is up to AWS. So
`producer/serverless.yml` bundles `@aws-sdk/client-eventbridgev2` with a
negation, and the function runs the version pinned in `producer/package.json`:

```yaml
build:
  esbuild:
    exclude:
      - '@aws-sdk/*'
      - '!@aws-sdk/client-eventbridgev2'
```

## When to use a Custom Event Bus

AWS recommends the Custom Event Bus for new applications. It fits when several
teams or services consume the same events, when a consumer needs events in
order, or when events must be kept on the bus for later delivery. AWS service
events and SaaS partner events arrive on the default bus or a partner bus, and
reach a Custom Event Bus only through an event source; schedules stay on Classic
rules or EventBridge Scheduler. The
[Choosing a bus](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#choosing-a-bus)
section of the EventBridge event docs compares the two, including pricing,
Regions and quotas.

The Custom Event Bus is available in a subset of AWS Regions, and a subscriber
is created in its bus's Region. This example deploys to `us-east-1`, the
Framework's default Region; pass `--region` to deploy all three services to
another Region that offers the Custom Event Bus.

## Personal and preview stages

The default quota is 5 Custom Event Buses per account and Region, so deploy
`events` once per environment, such as `dev` and `prod`, rather than for every
personal stage. To have a personal stage subscribe to the `dev` bus, deploy
only `orders` and `producer` there and read the bus ARN through a `service`
resolver pinned to `dev`. The
[compose-shared-services](https://github.com/serverless/examples/tree/v4/compose-shared-services) example
shows that pattern, and the Compose guide describes it in
[Referencing a service deployed to a different stage](https://www.serverless.com/framework/docs/guides/compose#referencing-a-service-deployed-to-a-different-stage).

## Cost and cleanup

While the example is deployed, Amazon EventBridge bills the size of the events published to the bus and delivered to each subscriber and the storage of the events the bus retains, Lambda bills each invocation and the functions' compute time, Amazon SQS bills requests to the dead-letter queue, and CloudWatch Logs bills the functions' stored log data. See [Amazon EventBridge pricing](https://aws.amazon.com/eventbridge/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [Amazon SQS pricing](https://aws.amazon.com/sqs/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/).

A bus with subscribers attached can't be deleted, so remove the consumers and the producer before `events`. `serverless remove` runs in the reverse of the deploy order, so from this directory it removes `orders` and `producer` first, then `events`:

```bash
serverless remove
```

To remove the services one at a time, keep the same order:

```bash
serverless remove --service=orders,producer
serverless remove --service=events
```

The bus has no `DeletionPolicy`, so removing `events` deletes the bus and the events it retains. For a long-lived environment, add `DeletionPolicy: Retain` and `UpdateReplacePolicy: Retain` to `OrdersBus` in [`events/serverless.yml`](https://github.com/serverless/examples/blob/v4/compose-eventbridge-custom-bus/events/serverless.yml); the bus then stays in the account after `serverless remove`, and you delete it yourself.

## Next steps

- Read [EventBridge events: Custom Event Bus](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#custom-event-bus) for every subscriber setting, subscribing to a bus in another account, and moving a consumer from a Classic bus.
- Read [Serverless Compose](https://www.serverless.com/framework/docs/guides/compose) for parameters between services and deploying one service at a time.
- Match AWS service events or your own on the default bus with a rule, as the [EventBridge rule example](https://github.com/serverless/examples/tree/v4/aws-node-eventbridge-rule) does.
- Read [Ordering on a Custom Event Bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus-ordering.html) in the EventBridge user guide.
