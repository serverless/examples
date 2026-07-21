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

# Dot Net REST API with DynamoDB

A CRUD REST API (create, get, update) backed by DynamoDB, built on .NET 10 and running on the
`dotnet10` (arm64) managed runtime.

## Structure

```
├── DotNetServerless.sln
├── src
│   ├── DotNetServerless.Application   # domain: entities, handlers, DynamoDB repository
│   └── DotNetServerless.Lambda        # Lambda entry points + serverless.yml
└── tests
    └── DotNetServerless.Tests
```

All commands below are run from `src/DotNetServerless.Lambda`:

```bash
cd src/DotNetServerless.Lambda
```

## Configure

The service is configured via an `env.configs.yml` file (git-ignored, create it locally before
packaging/deploying):

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

The `package.json` in `src/DotNetServerless.Lambda` provides the following commands:

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

## Deploy

```bash
npm run deploy
```

## Usage

The service exposes three endpoints:

```bash
# Create an item
curl --request POST \
  --url https://<api-id>.execute-api.<region>.amazonaws.com/dev/items \
  --header 'Content-Type: application/json' \
  --data '{"Code": "item-code", "Description": "My item", "IsChecked": false}'

# Get an item
curl --request GET \
  --url https://<api-id>.execute-api.<region>.amazonaws.com/dev/items/{id}

# Update an item
curl --request PUT \
  --url https://<api-id>.execute-api.<region>.amazonaws.com/dev/items \
  --header 'Content-Type: application/json' \
  --data '{"Id": "<id>", "Code": "item-code", "Description": "Updated item", "IsChecked": true}'
```
