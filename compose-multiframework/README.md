<!--
title: 'Serverless Compose of Serverless, CloudFormation, and SAM'
description: 'Use Serverless Compose to deploy a Serverless Framework service, an AWS SAM template and a CloudFormation stack together as one project.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/eahefnawy'
authorName: 'Eslam λ Hefnawy'
authorAvatar: 'https://avatars.githubusercontent.com/u/2312463?v=4'
-->

# Serverless Framework Compose: Multiframework Deployment

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/compose-multiframework.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This example deploys three services written for three tools, a Serverless Framework service, an AWS SAM template and a plain CloudFormation template, with one `serverless deploy`. Serverless Compose orders the deployments and passes one service's outputs to the others. Use it when a project mixes these template types and you want one tool to deploy them together.

## What it deploys

Three CloudFormation stacks per stage:

- `shared-resources-example-<stage>`, from `cloudformation/template.yml`: a DynamoDB table, `shared-table-<stage>`, with provisioned capacity, and a `TableName` output.
- `traditional-<stage>`, from `traditional/serverless.yml`: a Lambda function behind an API Gateway HTTP API, with an IAM role and a log group.
- `sam-compose-service-example-<stage>`, from `sam/template.yml`: a Lambda function behind an API Gateway HTTP API, with an IAM role and a log group, and an `Endpoint` output.

Both functions receive the table name and the stage's `domain` parameter in environment variables and return them.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Run the deploy from this directory, where `serverless-compose.yml` lives:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Serverless ϟ Compose

✔ shared-resources-example
    TableName: shared-table-dev

✔ sam
    Endpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com

✔ traditional
    HelloLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:traditional-dev-hello:1
    HttpApiId: xxxxxxxxxx
    HttpApiUrl: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com

Results: 3 services succeeded, 0 failed, 0 skipped, 3 total    Time: 1m 16s
```

Compose deploys `shared-resources-example` first, then `traditional` and `sam` in parallel. To print each service's outputs again later, run `serverless info` in the same directory.

## Try it

Call the traditional service's endpoint, which `serverless info` prints for `traditional`:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
```

The function answers with the table name it received from the CloudFormation stack and the `domain` parameter of the default stage. For the `dev` stage:

```json
{"service":"traditional","tableName":"shared-table-dev","domain":"dev-api.acmeinc.com"}
```

Call the SAM service's `Endpoint` output the same way. It answers with the same table name and domain, and `"service":"sam"`.

## How it works

`serverless-compose.yml` lists the three services and their parameters. The `${shared-resources-example.TableName}` references tell Compose that `traditional` and `sam` depend on `shared-resources-example`, so it deploys that stack first and passes its `TableName` output to both:

```yaml
stages:
  default:
    params:
      domain: "dev-api.acmeinc.com"
  prod:
    params:
      domain: "prod-api.acmeinc.com"

services:
  shared-resources-example:
    path: cloudformation
    params:
      tableNamePrefix: shared-table

  traditional:
    path: traditional
    params:
      tableName: ${shared-resources-example.TableName}

  sam:
    path: sam
    params:
      tableName: ${shared-resources-example.TableName}
```

Each service reads its parameters with `${param:...}`, in its own template format. The CloudFormation template builds the table name from its parameter and the stage:

```yaml
TableName: ${param:tableNamePrefix}-${sls:stage}
```

The traditional service and the SAM template pass the table name and the domain to their functions:

```yaml
environment:
  TABLE_NAME: ${param:tableName}
  DOMAIN: ${param:domain}
```

The `stages` block holds stage-specific values. Every stage uses the `default` parameters unless it has its own block, such as `prod`; deploy to another stage with `serverless deploy --stage prod`.

Every stack name includes the stage, so each stage you deploy gets its own stacks and its own table. The traditional service's stack is its `service` name and the stage, as for any `serverless.yml` service. The CloudFormation and SAM stacks take `stack_name` from the `samconfig.toml` next to each template, which adds the stage with a variable:

```toml
[default.global.parameters]
stack_name = "shared-resources-example-${sls:stage}"
```

Without a `stack_name`, a CloudFormation or SAM service in Compose deploys to a stack named after its Compose service key, the same stack in every stage.

The [Serverless Compose guide](https://www.serverless.com/framework/docs/guides/compose) covers dependencies and shared outputs, the [AWS SAM and CloudFormation guide](https://www.serverless.com/framework/docs/guides/sam) covers deploying those templates, and the [variables guide](https://www.serverless.com/framework/docs/guides/variables) covers `${param:...}` and the other variable sources.

## Cost and cleanup

Each stage you deploy has its own three stacks. While a stage is deployed, Lambda bills each request and the functions' compute time, and API Gateway bills each request. The stage's DynamoDB table uses provisioned capacity, five read and five write units, which is billed by the hour while the table exists, whether or not you use it. The functions' logs go to CloudWatch Logs, which bills for stored log data. Both functions' log groups are part of their stacks, and `serverless remove` deletes them with their logs. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/), [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove all three stacks of a stage, in reverse dependency order, from this directory:

```bash
serverless remove
```

Compose removes `traditional` and `sam` first, then `shared-resources-example` with the table.

## Next steps

- Read the [Serverless Compose guide](https://www.serverless.com/framework/docs/guides/compose) to split a project into services.
- Share resources between Framework services with the [Compose shared services example](https://github.com/serverless/examples/tree/v4/compose-shared-services).
- Connect services through an event bus with the [Compose EventBridge example](https://github.com/serverless/examples/tree/v4/compose-eventbridge-custom-bus).
