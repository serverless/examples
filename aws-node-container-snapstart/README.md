<!--
title: 'AWS Lambda container image with SnapStart (NodeJS)'
description: 'Deploy a Node.js Lambda function as a container image with SnapStart enabled, including the Dockerfile label that makes a non-Java/Python/.NET image snapshot-ready.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Container image with SnapStart

A Node.js function deployed as a **container image** with [Lambda SnapStart](https://www.serverless.com/framework/docs/providers/aws/guide/functions#snapstart) enabled. When the version is published, Lambda runs the initialization code once and snapshots the environment; invocations then restore from that snapshot instead of cold-starting.

The subject of this example is the one line that makes it work for a Node.js image:

```dockerfile
LABEL com.amazonaws.lambda.feature.snapstart="Allow"
```

Images built on the AWS base images for Java 11+, Python 3.12+ or .NET 8+ are SnapStart-ready without it. Any other image — the Node.js, Ruby and `provided.al2023` base images, or a custom base — must carry this label or implement the [SnapStart runtime hooks](https://docs.aws.amazon.com/lambda/latest/dg/snapstart-runtime-hooks-custom.html); otherwise publishing the version fails during deployment with `did not stabilize … An error occurred during function initialization`.

## Use cases

- Latency-sensitive HTTP APIs packaged as container images
- Functions whose initialization loads large dependencies or models

## Prerequisites

- Docker running locally (deploying builds the image and pushes it to ECR)
- An AWS account and credentials configured for the Serverless Framework

## Deploy

```bash
serverless deploy
```

The output lists the HTTP API endpoint.

## Test

Call the endpoint a few times:

```bash
curl https://<api-id>.execute-api.<region>.amazonaws.com/
```

The response reports how the environment started:

```json
{ "initializationType": "snap-start", "functionVersion": "1", "initializedAt": "…" }
```

`initializationType` is `snap-start` because the HTTP API invokes the `snapstart` alias the Framework publishes on every deploy. In CloudWatch Logs the first invocation of a fresh environment shows a `RESTORE_REPORT` line with the restore duration instead of an `INIT_REPORT`.

Invoking the function by its unqualified name skips the snapshot:

```bash
serverless invoke -f hello
```

returns `"initializationType": "on-demand"` and `"functionVersion": "$LATEST"`.

## What to keep in mind

- **Uniqueness.** Everything at module scope is captured once and shared by every restored environment. Do not create random seeds, unique IDs or cached credentials during initialization; create them inside the handler. See [Handling uniqueness with Lambda SnapStart](https://docs.aws.amazon.com/lambda/latest/dg/snapstart-uniqueness.html).
- **Cost.** AWS bills a cached snapshot per published version for runtimes other than Java. This example sets `versionFunctions: false` so each deploy deletes the superseded version; with the default, every deploy would retain another billed snapshot. See [Cost of retained versions](https://www.serverless.com/framework/docs/providers/aws/guide/functions#cost-of-retained-versions).
- **Limits.** SnapStart cannot be combined with provisioned concurrency, EFS, S3 Files, or ephemeral storage above 512 MB.

## Remove

```bash
serverless remove
```

This deletes the function, its versions and snapshots, and the ECR repository the Framework created.
