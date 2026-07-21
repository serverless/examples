<!--
title: 'TypeScript REST API with DynamoDB'
description: This example shows your how to create a TypeScript powered REST API with DynamoDB.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/QuantumInformation'
authorName: Nikos
authorAvatar: 'https://avatars0.githubusercontent.com/u/216566?v=4&s=140'
-->

# Introduction

TypeScript (ts) offers type safety which is helpful when working with the AWS SDK, which comes with ts definitions (d.ts)

# TypeScript

> Note: TypeScript is intentionally held at `5.x` — the TypeScript 7 native compiler isn't yet
> supported by the surrounding ecosystem tooling (checked 2026-07-20).

Serverless Framework v4 bundles TypeScript handlers natively (via its built-in esbuild integration), so there is no separate compile step and no build plugin to install. Just run `npm i` and deploy; `todos/create.ts`, `todos/list.ts`, `todos/get.ts` and `todos/update.ts` are packaged directly.

You can still type-check the project without emitting output by running `npx tsc --noEmit`.

## Usage

You can create, retrieve, update, or delete todos with the following commands:

### Create a Todo

```bash
curl -X POST https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos --data '{ "text": "Learn Serverless" }'
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### List all Todos

```bash
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
```

Example output:
```bash
[{"text":"Deploy my first service","id":"ac90feaa11e6-9ede-afdfa051af86","checked":true,"updatedAt":1479139961304},{"text":"Learn Serverless","id":"206793aa11e6-9ede-afdfa051af86","createdAt":1479139943241,"checked":false,"updatedAt":1479139943241}]%
```

### Get one Todo

```bash
# Replace the <id> part with a real id from your todos table
curl https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id>
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":false,"updatedAt":1479138570824}%
```

### Update a Todo

```bash
# Replace the <id> part with a real id from your todos table
curl -X PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/<id> --data '{ "text": "Learn Serverless", "checked": true }'
```

Example Result:
```bash
{"text":"Learn Serverless","id":"ee6490d0-aa11e6-9ede-afdfa051af86","createdAt":1479138570824,"checked":true,"updatedAt":1479138570824}%
```
