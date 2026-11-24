<!--
title: 'Customer-managed Lambda runtime with Node.js'
description: 'Publish a customer-managed Lambda runtime from a container image and run a Node.js function on it through a runtime alias, with Serverless Compose.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Customer-managed Lambda runtime

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-customer-managed-runtime.svg)](https://github.com/serverless/examples/blob/verified/results.json)

A [customer-managed runtime](https://docs.aws.amazon.com/lambda/latest/dg/runtimes-customer-managed.html) is a Lambda runtime that your organization builds from a container image, publishes and updates, for example Node.js with your company's SDK and monitoring agent built in. Functions use it through a runtime alias and keep deploying .zip files; when the publisher moves the alias to a new runtime version, the functions pick it up without a redeploy. This example publishes a runtime from one service and runs a Node.js function on it from another, deployed together with Serverless Compose.

## What it deploys

Two CloudFormation stacks per stage, deployed by [`serverless-compose.yml`](https://github.com/serverless/examples/blob/v4/aws-node-customer-managed-runtime/serverless-compose.yml):

- `cmr-runtime-<stage>`, from `runtime/serverless.yml`, the publisher: a runtime named `platform-node24-<stage>`, its version `v1` made from a container image, and the alias `stable` that points at `v1`. Its `RuntimeAliasArn` output is the alias ARN.
- `cmr-app-<stage>`, from `app/serverless.yml`, the consumer: a Lambda function, `hello`, that runs on the `stable` alias, with an IAM role and a CloudWatch Logs log group.

Before the deploy, you push the runtime image to an Amazon ECR repository, `cmr-runtime-<stage>`. The image is the Lambda Node.js 24 base image plus a file, `/etc/runtime-info.json`, that the function reads to show which runtime it runs on.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and [Docker](https://docs.docker.com/get-started/get-docker/), to create the image repository and push the runtime image.

## Deploy

Run every command from this directory, where `serverless-compose.yml` lives. Set the Region and stage you deploy to, and your account ID:

```bash
REGION=us-east-1
STAGE=dev
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REPO=cmr-runtime-$STAGE
```

**1. Push the runtime image.** Lambda creates a runtime version from an image that is already in ECR, so the image goes first. Create the repository, let Lambda read this account's runtime images from it, then build the image for arm64 and push it as `v1`:

```bash
aws ecr create-repository --repository-name "$REPO" --region "$REGION"
aws ecr set-repository-policy --repository-name "$REPO" --region "$REGION" --policy-text '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "LambdaRuntimeVersions",
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"],
    "Condition": {
      "StringEquals": { "aws:SourceAccount": "'"$ACCOUNT_ID"'" },
      "ArnLike": { "aws:SourceArn": "arn:aws:lambda:'"$REGION"':'"$ACCOUNT_ID"':runtime/*" }
    }
  }]
}'
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
docker build --platform linux/arm64 --provenance=false -t "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:v1" runtime
docker push "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$REPO:v1"
```

Without the repository policy, the deploy stops with `Lambda does not have permission to access the ECR image`. The Dockerfile only copies a file onto the base image, so it builds for arm64 on any machine.

**2. Deploy both services:**

```bash
serverless deploy --stage "$STAGE" --region "$REGION"
```

Compose deploys `runtime` first, because `app` reads its `RuntimeAliasArn` output. You should see output like this:

```text
Serverless ϟ Compose

✔ runtime
    RuntimeAliasArn: arn:aws:lambda:us-east-1:123456789012:runtime/platform-node24-dev/alias/stable
    ServerlessDeploymentBucketName: serverless-framework-deployments-us-east-1-xxxxxxxx-xxxx

✔ app
    HelloLambdaFunctionQualifiedArn: arn:aws:lambda:us-east-1:123456789012:function:cmr-app-dev-hello:1
    ServerlessDeploymentBucketName: serverless-framework-deployments-us-east-1-xxxxxxxx-xxxx

Results: 2 services succeeded, 0 failed, 0 skipped, 2 total    Time: 1m 22s
```

## Try it

Invoke the function:

```bash
serverless invoke --service=app --function hello --stage "$STAGE" --region "$REGION"
```

It returns the contents of the file that only the runtime's image has, and the Node.js version of the runtime:

```json
{
    "message": "Hello from platform-node24 v1",
    "node": "v24.22.3"
}
```

## How it works

The publisher, [`runtime/serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-customer-managed-runtime/runtime/serverless.yml), defines the runtime, a version from the image you pushed, and an alias, and exports the alias ARN:

```yaml
resources:
  Resources:
    Runtime:
      Type: AWS::Lambda::Runtime
      Properties:
        Name: platform-node24-${sls:stage}
    RuntimeVersionV1:
      Type: AWS::Lambda::RuntimeVersion
      Properties:
        RuntimeName: !Select [1, !Split ['runtime/', !Ref Runtime]]
        Name: v1
        ImageUri: ${aws:accountId}.dkr.ecr.${aws:region}.amazonaws.com/${self:service}-${sls:stage}:v1
    RuntimeAliasStable:
      Type: AWS::Lambda::RuntimeAlias
      Properties:
        RuntimeName: !Select [1, !Split ['runtime/', !Ref Runtime]]
        Name: stable
        RuntimeVersion: !Select [1, !Split ['version/', !Ref RuntimeVersionV1]]

  Outputs:
    RuntimeAliasArn:
      Value: !Ref RuntimeAliasStable
```

`serverless-compose.yml` passes that output to the consumer as a parameter:

```yaml
services:
  runtime:
    path: runtime

  app:
    path: app
    params:
      runtimeAliasArn: ${runtime.RuntimeAliasArn}
```

The consumer, [`app/serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-customer-managed-runtime/app/serverless.yml), sets `runtime` to the alias ARN, the way it would set `nodejs24.x`:

```yaml
provider:
  name: aws
  architecture: arm64
  runtime: ${param:runtimeAliasArn}

functions:
  hello:
    handler: handler.hello
```

The Framework deploys the function with `Runtime: custom` and a `RuntimeConfig` that names the runtime and the alias. The handler format is the one the runtime defines; this runtime is built on the Lambda Node.js base image, so it is `file.export`, as on `nodejs24.x`. The function's `architecture` must be one the runtime's image supports, here `arm64`.

In practice, a platform team publishes the runtime from its own project and gives application teams the alias ARN, often from another AWS account. The application's `serverless.yml` stays the same, with the ARN written in, or read with `${ssm:…}` or `${cf:…}`. See [Customer-managed runtimes](https://www.serverless.com/framework/docs/providers/aws/guide/functions#customer-managed-runtimes) for the permissions that sharing needs and how `runtimeManagement` controls when functions pick up a new version.

## Cost and cleanup

While the example is deployed, Lambda bills each invocation and the function's compute time, Amazon ECR bills the image's storage, and CloudWatch Logs bills the function's stored logs. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [Amazon ECR pricing](https://aws.amazon.com/ecr/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove both stacks, then the image repository, when you are done:

```bash
serverless remove --stage "$STAGE" --region "$REGION"
aws ecr delete-repository --repository-name "$REPO" --force --region "$REGION"
```

After the remove, Lambda keeps the runtime's name, `platform-node24-<stage>`, reserved for up to 30 days, so deploying the same stage again in that time fails until the name is released; deploy with another stage instead. A deleted runtime also counts against the account's [runtime quota](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) until then.

## Next steps

- Read [Customer-managed runtimes](https://www.serverless.com/framework/docs/providers/aws/guide/functions#customer-managed-runtimes) in the functions guide: permissions, sharing a runtime with other accounts, runtime updates and limitations.
- Read about [runtime versions and aliases](https://docs.aws.amazon.com/lambda/latest/dg/cmr-versions.html) in the AWS Lambda Developer Guide, to publish `v2` and move `stable` to it.
- Start from a function on a Lambda-managed runtime in the [AWS Node.js example](https://github.com/serverless/examples/tree/v4/aws-node).
