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

Three CloudFormation stacks:

- `shared-resources-example`, from `cloudformation/template.yml`: a DynamoDB table, `shared-table-<stage>`, with provisioned capacity, and a `TableName` output.
- `traditional-<stage>`, from `traditional/serverless.yml`: a Lambda function behind an API Gateway HTTP API, with an IAM role and a log group.
- `sam-compose-service-example`, from `sam/template.yml`: a Lambda function behind an API Gateway HTTP API, with an IAM role, and an `Endpoint` output.

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

The stack names come from each tool's own naming. The traditional service's stack is its `service` name and the stage. The CloudFormation stack takes the Compose service key, `shared-resources-example`, and the SAM stack takes `stack_name` from `sam/samconfig.toml`; neither name includes the stage, so each stage you deploy updates the same two stacks.

The [Serverless Compose guide](https://www.serverless.com/framework/docs/guides/compose) covers dependencies and shared outputs, the [AWS SAM and CloudFormation guide](https://www.serverless.com/framework/docs/guides/sam) covers deploying those templates, and the [variables guide](https://www.serverless.com/framework/docs/guides/variables) covers `${param:...}` and the other variable sources.

## Cost and cleanup

Lambda and API Gateway charge per request and for compute time, and light use stays within the AWS free tier. The DynamoDB table uses provisioned capacity, which is billed by the hour while the table exists, whether or not you use it; five read and five write units stay within the AWS free tier. Remove all three stacks, in reverse dependency order, from this directory:

```bash
serverless remove
```

Compose removes `traditional` and `sam` first, then `shared-resources-example` with the table.

## Next steps

- Read the [Serverless Compose guide](https://www.serverless.com/framework/docs/guides/compose) to split a project into services.
- Share resources between Framework services with the [Compose shared services example](https://github.com/serverless/examples/tree/v4/compose-shared-services).
- Connect services through an event bus with the [Compose EventBridge example](https://github.com/serverless/examples/tree/v4/compose-eventbridge-custom-bus).
