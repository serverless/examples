<!--
title: 'AWS Python Example'
description: 'This template demonstrates how to deploy a Python function running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: Python
priority: 10
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework AWS Python Example

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-python.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys one Python function to AWS Lambda. The function has no events and no database, so it is the smallest service you can deploy and invoke. Start here to learn the deploy and invoke loop, then add the [events](https://www.serverless.com/framework/docs/providers/aws/events/) your use case needs.

## What it deploys

- A Lambda function, `hello`.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

## Prerequisites

- [Python](https://www.python.org/) 3.14, to run the function locally and to package dependencies when you add them.
- [Node.js](https://nodejs.org/), to install the Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Run the deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-python" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-python-dev (41s)
functions:
  hello: aws-python-dev-hello (2.7 kB)
```

## Try it

Invoke the deployed function:

```bash
serverless invoke --function hello
```

The command prints the function's response:

```json
{
    "statusCode": 200,
    "body": "{\"message\": \"Go Serverless v4.0! Your function executed successfully!\"}"
}
```

## How it works

`serverless.yml` declares the function and its runtime:

```yaml
provider:
  name: aws
  runtime: python3.14
  architecture: arm64

functions:
  hello:
    handler: handler.hello
```

`handler.hello` points at the `hello` function in `handler.py`, which returns a status code and a JSON body:

```python
def hello(event, context):
    body = {
        "message": "Go Serverless v4.0! Your function executed successfully!"
    }

    return {"statusCode": 200, "body": json.dumps(body)}
```

### Run it locally

Invoke the function on your machine:

```bash
serverless invoke local --function hello
```

The command prints the same response as the deployed function.

### Add dependencies

The Framework packages Python dependencies itself, with no plugin. List them in a `requirements.txt` file and add a `custom.pythonRequirements` block to `serverless.yml` to turn the packaging on:

```yaml
custom:
  pythonRequirements: {}
```

The deploy then installs the requirements into the Lambda package. `Pipfile` and `pyproject.toml` work too, with the configuration the [Python requirements guide](https://www.serverless.com/framework/docs/providers/aws/guide/python) describes.

## Cost and cleanup

While the example is deployed, Lambda bills each invocation and the function's compute time; while you do not invoke the function, it bills nothing. Until you remove the stack, the function's logs stay in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function and its log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [functions guide](https://www.serverless.com/framework/docs/providers/aws/guide/functions) for memory, timeouts and environment variables.
- Put the function behind an HTTP endpoint with the [HTTP API example](https://github.com/serverless/examples/tree/v4/aws-python-http-api).
- Run it on a schedule with the [scheduled cron example](https://github.com/serverless/examples/tree/v4/aws-python-scheduled-cron).
