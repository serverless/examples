<!--
title: Serverless Framework Compose - EventBridge Custom Event Bus Subscribers
description: Own an EventBridge Custom Event Bus in a stateful service and subscribe functions from other services to it, with ordered and batched delivery, wired together with Serverless Compose.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Compose: EventBridge Custom Event Bus Subscribers

The EventBridge [Custom Event Bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus.html)
routes events to subscribers and keeps every event for a retention period of 1
to 365 days. Consumers attach their own subscribers to a bus that another stack
owns, and each subscriber filters the events and delivers the matching ones to
one target. When the `eventBus` of an `eventBridge` function event is a Custom
Event Bus, the Serverless Framework creates an `AWS::EventsV2::Subscriber` for
the function instead of a rule.

This example composes three services:

- **`events`**: a stateful, resource-only service that owns the bus and outputs
  its ARN. Deploy it once per environment.
- **`orders`**: two consumers of the bus.
  - `fulfil` receives one `OrderPlaced` event per invocation, in publish order
    within each event group (`ordering: fifo`, `batchSize: 1`).
  - `audit` keeps the Custom Event Bus defaults: it receives an array of
    events, and undeliverable events go to a dead-letter queue.
- **`producer`**: a function that publishes order events with
  `@aws-sdk/client-eventbridgev2`.

```text
   ┌──────────────┐  PutEvents   ┌──────────────────────┐  subscribers  ┌──────────────────────┐
   │   producer   │ ───────────▶ │        events        │ ────────────▶ │        orders        │
   │   publish    │              │  bus orders-<stage>  │               │ fulfil: fifo, 1 event│
   └──────────────┘              │  7-day retention     │               │ audit: array + DLQ   │
                                 └──────────────────────┘               └──────────────────────┘
           ▲                                │                                      ▲
           └──────────── ${service:events.OrdersBusArn} (Compose params) ─────────┘
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

## How the services are wired

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

## The consumers

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

### `fulfil`: one event at a time, in order

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

### `audit`: the Custom Event Bus defaults

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

## The delivery role

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

## The producer

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

## Usage

Install the producer's dependencies:

```bash
cd producer && npm install && cd ..
```

### Deploy

Deploy all three services. Compose deploys `events` first, then `orders` and
`producer`:

```bash
serverless deploy
```

### Publish events

Invoke the producer. It publishes `count` `OrderPlaced` events (1 to 10,
default 3) for one customer, one after another, and returns their sequence
numbers:

```bash
serverless producer invoke --function publish --data '{"count":5}'
```

### Check the consumers

`fulfil` logs one event per invocation, with `sequence` in publish order. The
excerpts below show only the handlers' JSON lines; `serverless logs` also
prints each line's timestamp and request id, and the START, END and REPORT
lines.

```bash
serverless orders logs --function fulfil
```

```text
{"handler":"fulfil","orderId":"46bcf29d-…","sequence":1,…}
{"handler":"fulfil","orderId":"3fc7291c-…","sequence":2,…}
{"handler":"fulfil","orderId":"c0ec4506-…","sequence":3,…}
{"handler":"fulfil","orderId":"2a18361d-…","sequence":4,…}
{"handler":"fulfil","orderId":"ae0265ec-…","sequence":5,…}
```

`audit` logs the size of each array it receives. How the five events are split
into batches, and in what order, varies from run to run:

```bash
serverless orders logs --function audit
```

```text
{"handler":"audit","received":1,"orders":["3fc7291c-…"]}
{"handler":"audit","received":3,"orders":["2a18361d-…","ae0265ec-…","c0ec4506-…"]}
{"handler":"audit","received":1,"orders":["46bcf29d-…"]}
```

## Personal and preview stages

The default quota is 5 Custom Event Buses per account and Region, so deploy
`events` once per environment, such as `dev` and `prod`, rather than for every
personal stage. To have a personal stage subscribe to the `dev` bus, deploy
only `orders` and `producer` there and read the bus ARN through a `service`
resolver pinned to `dev`. The
[compose-shared-services](https://github.com/serverless/examples/tree/v4/compose-shared-services) example
shows that pattern, and the Compose guide describes it in
[Referencing a service deployed to a different stage](https://www.serverless.com/framework/docs/guides/compose#referencing-a-service-deployed-to-a-different-stage).

## Removal

A bus with subscribers attached can't be deleted, so remove the consumers and
the producer before `events`. `serverless remove` runs in the reverse of the
deploy order, so from this directory it removes `orders` and `producer` first,
then `events`:

```bash
serverless remove
```

To remove the services one at a time, keep the same order:

```bash
serverless remove --service=orders,producer
serverless remove --service=events
```

The bus has no `DeletionPolicy`, so removing `events` deletes the bus and the
events it retains. For a long-lived environment, add `DeletionPolicy: Retain`
and `UpdateReplacePolicy: Retain` to `OrdersBus` in `events/serverless.yml`; the
bus then stays in the account after `serverless remove`, and you delete it
yourself.

## Learn more

- [EventBridge event: Custom Event Bus](https://www.serverless.com/framework/docs/providers/aws/events/event-bridge#custom-event-bus)
- [Serverless Compose](https://www.serverless.com/framework/docs/guides/compose)
- [Function build configuration](https://www.serverless.com/framework/docs/providers/aws/guide/building)
- [Amazon EventBridge Custom Event Bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus.html)
- [Ordering on a Custom Event Bus](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-custom-bus-ordering.html)
