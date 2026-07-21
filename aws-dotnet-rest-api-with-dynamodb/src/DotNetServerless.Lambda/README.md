<!--
title: 'Dot Net REST API with DynamoDB'
description: 'Setup a REST API w/ DynamoDB using .NET 10'
framework: v4
platform: AWS
language: CSharp
priority: 10
authorLink: 'https://github.com/samueleresca'
authorName: 'Samuele Resca'
authorAvatar: 'https://avatars0.githubusercontent.com/u/8921095?v=4&s=140'
-->

# DotNetServerless

The following AWS Lambda functions are built on .NET 10 and run on the `dotnet10` (arm64)
managed runtime.

## Configure lambda

It is possible configure the lambda by editing the `env.configs.yml` file (git-ignored, create
it locally before packaging/deploying):

```
feature: <feature_name>
version: 1.0.0.0
region: <aws_region>
environment: <environment>
dynamoTable: <dynamo_table_name>
```

Quickest way to get one: `cp env.configs.example.yml env.configs.yml` and edit the placeholder
values — `serverless print`/`package`/`deploy` all fail without this file present.

## Build

Requires the .NET 10 SDK and the [Amazon.Lambda.Tools](https://github.com/aws/aws-extensions-for-dotnet-cli)
local tool (restored automatically via the checked-in `.config/dotnet-tools.json` manifest).

This directory contains a `package.json` file with the following commands (run from here,
`src/DotNetServerless.Lambda`):

```bash
npm run build   # dotnet tool restore && dotnet restore && dotnet lambda package (arm64)
npm run test    # dotnet test
npm run deploy  # build + test + serverless deploy
```

`npm run build` is equivalent to:

```bash
dotnet tool restore
dotnet restore
dotnet lambda package --configuration release --framework net10.0 --function-architecture arm64 \
  --output-package bin/release/net10.0/deploy-package.zip
```

which produces `bin/release/net10.0/deploy-package.zip`, the artifact referenced by
`serverless.yml`.

> **Note:** building this example requires the .NET 10 SDK. Run the package step above,
> then deploy.

## Deploy

```bash
npm run deploy
```
