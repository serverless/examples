<!--
title: Serverless Framework Compose - Multiframework Deployment
description: Use Serverless Compose to orchestrate a traditional Serverless Framework service, an AWS SAM template, and a raw CloudFormation stack as one deployment.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Compose: Multiframework Deployment

Deploying multiple services in a monorepository is a common pattern in larger teams. Serverless Framework Compose simplifies the deployment and orchestration of these services by offering:

1. Parallel deployment of multiple services
2. Ordered deployment of services
3. Support for deploying different types of services (e.g., Traditional, SAM, CloudFormation) together
4. Sharing outputs between services
5. Running commands across multiple services

In this example, we demonstrate how to use Serverless Compose to deploy three types of services together:

1. AWS CloudFormation Service: Deploys shared resources with outputs that are referenced by the other services.
2. Serverless Framework Traditional Service
3. AWS SAM Template Service

The AWS CloudFormation service is deployed first to create shared resources, followed by the parallel deployment of the Traditional and AWS SAM services.

This example also illustrates how to use Serverless Variables with Serverless Compose for organizing and structuring your application, as well as managing different stages.

For more information about Serverless Compose, please see the [Serverless Compose docs](https://www.serverless.com/framework/docs/guides/compose)

For more information about using AWS SAM and or AWS CloudFormation templates with the Serverless Framework, please see the [AWS SAM/CFN docs](https://www.serverless.com/framework/docs/guides/sam)

For more information about Serverless Variables, please see the [Serverless Variables docs](https://www.serverless.com/framework/docs/guides/variables)

## Usage

### Deployment

Run the following command from the root of this example (where `serverless-compose.yml` lives):

```bash
serverless deploy
```

Compose reads the dependency graph implied by the `${service.Output}` variable references in `serverless-compose.yml` and deploys the three sub-stacks in the correct order:

1. **`shared-resources-example`** (`cloudformation/template.yml`) deploys first. It creates a shared DynamoDB table and exposes its name via the `TableName` stack output.
2. **`traditional`** (`traditional/serverless.yml`) and **`sam`** (`sam/template.yml`) deploy next, in parallel, since both only depend on `shared-resources-example`. Each receives the shared table name through the `tableName` param, which Compose resolves from `${shared-resources-example.TableName}`.

Stage-specific values (such as the `domain` param) come from the `stages` block at the top of `serverless-compose.yml`; deploy to a specific stage with `serverless deploy --stage prod`.

### Removal

```bash
serverless remove
```

This tears down the services in reverse dependency order (`traditional` and `sam` first, then `shared-resources-example`).
