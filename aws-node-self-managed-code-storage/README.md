<!--
title: 'AWS Lambda Self-Managed Code Storage'
description: 'Run Lambda function and layer code directly from the deployment bucket with self-managed code storage.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# AWS Lambda Self-Managed Code Storage

This example demonstrates Lambda self-managed code storage with the Serverless Framework. By default, Lambda copies your deployment package into Lambda-managed storage (`copy` mode). With self-managed storage, Lambda runs your function and layer code directly from the Serverless Framework deployment bucket instead:

- Your code no longer counts against the Lambda code storage quota.
- Deployments activate faster.
- Service rollbacks restore exactly the code a deployment ran, because every deployment pins its functions and layers to exact S3 object versions.

Enabling it is a single setting:

```yaml
provider:
  deploymentBucket:
    codeStorageMode: reference # default: copy
```

The Framework handles the AWS requirements automatically: the deployment bucket it manages is already versioned, and the bucket policy statement that grants the Lambda service read access (scoped to your account) is added on the first deploy. The example also includes a Lambda layer to show that layers participate in self-managed storage the same way functions do.

See the [deployment bucket guide](https://www.serverless.com/framework/docs/guides/deployment-bucket#code-storage-mode-self-managed-lambda-code-storage) for the full feature documentation, and the [AWS documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-self-managed-storage.html) for platform details.

## Usage

### Deployment

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "aws-node-self-managed-code-storage" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-self-managed-code-storage-dev (60s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: aws-node-self-managed-code-storage-dev-hello (1 kB)
layers:
  utils: arn:aws:lambda:us-east-1:xxxxxxxxxxxx:layer:utils:1
```

### Invocation

After a successful deployment, call the endpoint:

```
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in:

```json
{ "message": "Hello Serverless, this response was served straight from the deployment bucket!" }
```

The handler imports its greeting from the layer, so the response proves both the function and the layer run from self-managed storage.

## Artifact retention

In this mode, deployment artifacts in the bucket back your live Lambda versions, so the Framework retains deployments instead of cleaning them up after each deploy. Retirement is handled by the `prune` command: it deletes old function and layer versions, and with `--includeArtifacts` it also marks deployment artifacts that no longer back any surviving version:

```
serverless prune -n 5 --includeLayers --includeArtifacts
```

Artifacts that still back a version are always retained, and the sweep writes S3 delete markers only. Use `--dryRun` to preview. If you publish function versions or layers and have confirmed that versions beyond a certain age are no longer used, you can automate retention with the `custom.prune` configuration — see [artifact retention in reference mode](https://www.serverless.com/framework/docs/guides/deployment-bucket#artifact-retention-in-reference-mode) for the full retention story, including how to reclaim storage with an S3 lifecycle rule.

## Cleanup

Remove the service with:

```
serverless remove
```

This deletes the stack and the service's deployment artifacts from the deployment bucket.
