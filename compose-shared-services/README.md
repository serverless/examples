<!--
title: Serverless Framework Compose - Shared Data Service with Personal Stages
description: Use the Compose service resolver to share one stateful data service across many personal stages, wiring outputs between services both same-stage and cross-stage.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Compose: Shared Data Service with Personal Stages

Teams often want one stateful data service — a database, a queue, a topic —
deployed once and shared, while every developer gets their own personal stage
for the stateless application services around it. This example shows how to do
that with Serverless Framework Compose and the `service` resolver.

It composes three services:

- **`orders-db`** — a shared, stateful DynamoDB table. Deployed once to a
  long-lived stage (`dev` here) and left running.
- **`worker`** — an SQS queue and the Lambda that drains it. Deployed per stage.
- **`api`** — an HTTP endpoint that writes an order to the shared table and
  enqueues a job for the worker. Deployed per stage.

## Why one shared data service

Giving every developer a full copy of the stack sounds tidy, but the stateful
part is where it hurts: N tables to pay for, N sets of seed data to load, N
schema migrations to run, and test data that never matches anyone else's. Keeping
the data service in one long-lived stage and pointing every personal stage at it
gives each developer isolated **application** code running against **real, shared
data** — while the things that do need isolation stay isolated: your `api` only
enqueues to your own `worker` queue, so a broken change in your stage cannot
touch anyone else's processing.

```text
   stage: dev  (shared — deployed once)          stage: <your-name>  (one per developer)
   ┌──────────────────┐                          ┌───────────────┐        ┌────────────────────┐
   │    orders-db     │◀── pinned to dev ────────│      api      │──────▶ │       worker       │
   │  DynamoDB table  │   ${shared:orders-db.…}  │   HTTP API    │ same   │  SQS queue + Lambda│
   └──────────────────┘                          └───────────────┘ stage  └────────────────────┘
                                                                  ${service:worker.…}
```

## How the services are wired

Everything lives in `serverless-compose.yml`. The `api` service reads outputs
from the other two using the `service` resolver, in two different ways:

```yaml
services:
  api:
    path: api
    params:
      jobsQueueUrl: ${service:worker.JobsQueueUrl}   # same-stage
      ordersTableName: ${shared:orders-db.TableName} # cross-stage
```

### Same-stage: `${service:worker.JobsQueueUrl}`

The built-in `service` resolver reads a service's output **at the stage of the
current run** and makes that service deploy first. So `worker` always deploys
before `api`, in the same stage, and `api` gets that stage's queue URL.

### Cross-stage: `${shared:orders-db.TableName}`

`shared` is a **named `service` resolver instance**, declared once at the top of
the compose file and pinned to a fixed stage:

```yaml
stages:
  default:
    params:
      dataStage: dev
    resolvers:
      shared:
        type: service
        stage: ${param:dataStage}
```

`${shared:orders-db.TableName}` reads `orders-db`'s output **as deployed to the
`dataStage`**, regardless of which stage the current run targets. That is what
lets many personal stages share a single data table.

A `service` reference only adds a deploy-ordering edge when the stage it reads is
the stage of the current run. When the pinned stage differs from the run stage,
`orders-db` is read but **not** deployed.

The `api` handler never learns which stage a value came from — Compose injects
both as ordinary params, and the handler reads plain environment variables:

```js
const TABLE_NAME = process.env.TABLE_NAME;       // shared, from dataStage
const JOBS_QUEUE_URL = process.env.JOBS_QUEUE_URL; // this run's stage
```

## Usage

Install the `api` service's dependencies first:

```bash
cd api && npm install && cd ..
```

### 1. Bootstrap the whole graph

Deploy everything once to the data stage. Here `dataStage` equals the run stage
(`dev`), so `${shared:orders-db.TableName}` resolves to the run stage and
`orders-db` deploys before `api` automatically — no `dependsOn` needed.

```bash
serverless deploy --stage dev
```

### 2. Deploy the app to a personal stage

Now deploy just the stateless services to your own stage. `dataStage` is still
`dev`, so `${shared:orders-db.TableName}` points at a different stage than the
run: `orders-db` is **not** deployed. Its `dev` table name is read and injected
into `api`, while `worker` deploys fresh in your stage.

```bash
serverless deploy --service=api,worker --stage <your-name>
```

Your personal `api` writes to the shared `dev` table and enqueues jobs on your
own `worker` queue. Each developer iterates on the app without touching the
shared data service.

### If the shared stage isn't there yet

Run step 2 before anyone has bootstrapped `dev`, and the run deploys `worker`
(everything it needs is in your stage) but stops on `api` with an error that
names the stage to fix and the exact command:

```text
✖ api
    Could not resolve the parameter 'orders-db.TableName': no deployed state found
    for service 'orders-db'. Deploy it first with
    'serverless deploy --service=orders-db --stage dev', then retry. If it is
    already deployed, refresh its state with 'serverless orders-db info --stage dev'.
```

`orders-db` is never created in your stage by accident — the pinned reference
reads `dev`, it does not deploy to your stage. Bootstrap `dev` (step 1), then
run step 2 again to finish `api`.

### Try it

`serverless deploy` prints the `api` endpoint. Post an order and watch the
response echo the two resolved values:

```bash
curl -X POST <endpoint>/orders -d '{"item":"widget"}'
# { "orderId": "...", "status": "created",
#   "wroteToTable": "<dev table name>", "enqueuedTo": "<your-stage queue url>" }
```

### Removal

Remove your personal stage (leaves the shared data service untouched):

```bash
serverless remove --service=api,worker --stage <your-name>
```

Tear down the bootstrap stage, including the shared table:

```bash
serverless remove --stage dev
```

## Learn more

- [Serverless Compose](https://www.serverless.com/framework/docs/guides/compose)
- [Service dependencies and variables](https://www.serverless.com/framework/docs/guides/compose#service-dependencies-and-variables)
- [Referencing a service deployed to a different stage](https://www.serverless.com/framework/docs/guides/compose#referencing-a-service-deployed-to-a-different-stage)
