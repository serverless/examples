<!--
title: 'AppSync GraphQL API with DynamoDB (NodeJS)'
description: 'An AWS AppSync GraphQL API with API key authentication and two JavaScript resolvers that write and read posts in a DynamoDB table, from the built-in appSync block of serverless.yml.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# AppSync GraphQL API with DynamoDB

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-appsync-dynamodb.svg)](https://github.com/serverless/examples/blob/verified/results.json)

[AWS AppSync](https://docs.aws.amazon.com/appsync/latest/devguide/what-is-appsync.html) serves a GraphQL API and resolves each field from a data source, such as a DynamoDB table, without a Lambda function in between. The Serverless Framework deploys an AppSync API from the top-level [`appSync` block](https://www.serverless.com/framework/docs/providers/aws/guide/appsync) of `serverless.yml`, with no plugin to install. This example creates a GraphQL API with API key authentication and two JavaScript resolvers, `createPost` and `getPost`, that write and read posts in a DynamoDB table.

## What it deploys

- An AppSync GraphQL API, named `appsync-dynamodb-<stage>`, with the schema in [`schema.graphql`](https://github.com/serverless/examples/blob/v4/aws-node-appsync-dynamodb/schema.graphql) and an API key that expires after 30 days.
- A DynamoDB table for the posts, with on-demand capacity.
- An AppSync data source for the table, with an IAM role that lets AppSync read and write it.
- Two unit resolvers in the `APPSYNC_JS` runtime: `Mutation.createPost` and `Query.getPost`.
- Two stack outputs: `GraphQlApiUrl`, the API's endpoint, and `GraphQlApiKey`, its API key.

## Prerequisites

- The Serverless Framework CLI: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- `curl`, to call the API. The commands in Try it are written for Bash.

## Deploy

Deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this, with the API's endpoints and its API key:

```text
Deploying "appsync-dynamodb" to stage "dev" (us-east-1)
✔ Service deployed to stack appsync-dynamodb-dev (51s)
appsync endpoints:
  graphql: https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql
  realtime: wss://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-realtime-api.us-east-1.amazonaws.com/graphql

appsync api keys:
  da2-xxxxxxxxxxxxxxxxxxxxxxxxxx (defaultKey)
```

## Try it

Copy the `graphql` endpoint and the API key from the deploy output into shell variables. `serverless info` prints them again:

```bash
API_URL=https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql
API_KEY=da2-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

Create a post. GraphQL requests are a `POST` with the query in a JSON body, and the API key goes in the `x-api-key` header:

```bash
curl -s "$API_URL" \
  -H 'content-type: application/json' \
  -H "x-api-key: $API_KEY" \
  -d '{"query":"mutation { createPost(title: \"Hello\") { id title } }"}'
```

The `createPost` resolver writes the post with a generated ID and returns it:

```json
{"data":{"createPost":{"id":"1c38c0b2-f396-47dc-9409-9f7ead9d7cea","title":"Hello"}}}
```

Read the post back by its ID, replacing the ID with the one you got:

```bash
curl -s "$API_URL" \
  -H 'content-type: application/json' \
  -H "x-api-key: $API_KEY" \
  -d '{"query":"query { getPost(id: \"1c38c0b2-f396-47dc-9409-9f7ead9d7cea\") { id title } }"}'
```

```json
{"data":{"getPost":{"id":"1c38c0b2-f396-47dc-9409-9f7ead9d7cea","title":"Hello"}}}
```

For an ID that has no post, `getPost` returns `null`. A request without the API key gets `401` from AppSync, which runs no resolver:

```bash
curl -s -w '\n%{http_code}\n' "$API_URL" \
  -H 'content-type: application/json' \
  -d '{"query":"query { getPost(id: \"1c38c0b2-f396-47dc-9409-9f7ead9d7cea\") { id title } }"}'
```

```text
{
  "errors" : [ {
    "errorType" : "UnauthorizedException",
    "message" : "You are not authorized to make this call."
  } ]
}
401
```

## How it works

The `appSync` block in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-appsync-dynamodb/serverless.yml) declares the API, its authentication, a data source for the table and a resolver for each field:

```yaml
appSync:
  name: ${self:service}-${sls:stage}
  authentication:
    type: API_KEY
  apiKeys:
    - name: defaultKey
      expiresAfter: 30d
  dataSources:
    postsTable:
      type: AMAZON_DYNAMODB
      config:
        tableName: !Ref PostsTable
  resolvers:
    Query.getPost:
      kind: UNIT
      dataSource: postsTable
      code: resolvers/getPost.js
    Mutation.createPost:
      kind: UNIT
      dataSource: postsTable
      code: resolvers/createPost.js
```

- The Framework reads the schema from `schema.graphql` next to `serverless.yml`. It defines a `Post` type, the `getPost` query and the `createPost` mutation.
- The API's name includes the stage, so each stage gets its own API.
- For the `AMAZON_DYNAMODB` data source, the Framework creates an IAM role that AppSync assumes to call the table, allowing item reads and writes on that table and its indexes only.
- Each resolver key is `<type>.<field>`. A `UNIT` resolver runs one data source request.
- The table itself is a DynamoDB resource under `resources`, since the `appSync` block doesn't create tables. Its name is left to CloudFormation, and `!Ref PostsTable` passes it to the data source.

Each resolver's `code` is a JavaScript file in the `APPSYNC_JS` runtime, with a `request` function that builds the DynamoDB request and a `response` function that shapes the result. [`resolvers/createPost.js`](https://github.com/serverless/examples/blob/v4/aws-node-appsync-dynamodb/resolvers/createPost.js) writes an item with an ID that `util.autoId()` generates:

```javascript
export function request(ctx) {
  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({ id: util.autoId() }),
    attributeValues: util.dynamodb.toMapValues({ title: ctx.args.title }),
  };
}
```

[`resolvers/getPost.js`](https://github.com/serverless/examples/blob/v4/aws-node-appsync-dynamodb/resolvers/getPost.js) reads the item with `GetItem`. `@aws-appsync/utils` is provided by the AppSync runtime: the Framework bundles each resolver with esbuild and leaves that import out, so the example has no dependencies to install.

The deploy prints the endpoint and the API key. The `Outputs` under `resources` also store them in the stack, through the `${appsync:url}` and `${appsync:apiKey.defaultKey}` variables, for tools that read stack outputs. An AppSync API key identifies the client, as in a web or mobile app; anyone who can read the stack's outputs can read it.

## Cost and cleanup

While the example is deployed, AppSync bills each query and mutation it receives, and DynamoDB bills each read and write request and the data the table stores. See [AWS AppSync pricing](https://aws.amazon.com/appsync/pricing/) and [Amazon DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/). Remove the stack, with the API, its key, the table and its posts, when you are done:

```bash
serverless remove
```

## Next steps

- Read [AppSync GraphQL APIs](https://www.serverless.com/framework/docs/providers/aws/guide/appsync) for the other `appSync` settings, and [Resolvers](https://www.serverless.com/framework/docs/providers/aws/guide/appsync/resolvers) for pipeline resolvers, TypeScript and Lambda resolvers.
- Require Amazon Cognito sign-in for the mutation and keep the query public with [additional authentication modes](https://www.serverless.com/framework/docs/providers/aws/guide/appsync/authentication).
- Build a REST API on the same kind of table with the [Express API with DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-node-express-dynamodb-api).
