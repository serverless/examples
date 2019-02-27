<!--
title: TODO
description: GraphQL API with AWS AppSync and a serverless Aurora backend
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/phjardas'
authorName: 'Philipp Jardas'
authorAvatar: 'https://avatars3.githubusercontent.com/u/1437300?s=140&v=4'
-->

# GraphQL API with AWS AppSync and a serverless Aurora backend

This application provides a GraphQL API implemented with [AWS AppSync](https://aws.amazon.com/appsync/).

Data is stored in a [Serverless Aurora](https://aws.amazon.com/rds/aurora/serverless/) database.

The glue between AppSync and Aurora is implemented using [Lambda](https://aws.amazon.com/lambda/) functions, one for each GraphQL resolver.

The application features anonymous access to the API using an [Cognito Identity Pool](https://docs.aws.amazon.com/cognito/latest/developerguide/identity-pools.html).

## Usage

Install dependencies:

```
npm install
```

Deploy the application:

```
npm run deploy -- [options]
```

With options:

- `--stage`: the serverless stage to deploy, defaults to `dev`.
- `--region`: the AWS region to deploy to, defaults to `eu-central-1`.
