<!--
title: 'AWS Simple HTTP Endpoint example in Python'
description: 'This template demonstrates how to make a simple HTTP API with Python running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: Python
priority: 6
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Python HTTP API on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-python-http-api.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys an HTTP API on AWS Lambda and API Gateway with Python. One `GET /` endpoint returns a JSON message. Start here when you want an HTTP endpoint and no database.

## What it deploys

- An API Gateway HTTP API with one route, `GET /`.
- A Lambda function, `hello`, that answers the route.
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

The deploy prints the endpoint URL, `https://<api-id>.execute-api.<region>.amazonaws.com/`.

## Try it

Call the endpoint with the URL the deploy printed:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
```

The function answers with status 200 and this body:

```json
{"message": "Go Serverless v4.0! Your function executed successfully!"}
```

## How it works

`serverless.yml` declares one function and connects it to the HTTP API with an `httpApi` event:

```yaml
functions:
  hello:
    handler: handler.hello
    events:
      - httpApi:
          path: /
          method: get
```

`handler.py` returns the status code and a JSON body:

```python
def hello(event, context):
    body = {
        "message": "Go Serverless v4.0! Your function executed successfully!",
    }

    response = {"statusCode": 200, "body": json.dumps(body)}

    return response
```

After the deploy, the API is public and anyone can call it. To restrict access, configure an authorizer, as the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) describe. To serve the API on your own domain, uncomment `domain` in `serverless.yml` and read the [custom domains guide](https://www.serverless.com/framework/docs/providers/aws/guide/domains).

### Run it locally

Invoke the function on your machine:

```bash
serverless invoke local --function hello
```

The command prints the function's response:

```json
{
  "statusCode": 200,
  "body": "{\"message\": \"Go Serverless v4.0! Your function executed successfully!\"}"
}
```

To emulate API Gateway and Lambda locally, install the `serverless-offline` plugin and start it. The install adds the plugin to `devDependencies` in `package.json` and to `plugins` in `serverless.yml`:

```bash
serverless plugin install -n serverless-offline
serverless offline
```

The plugin's [GitHub repository](https://github.com/dherault/serverless-offline) describes its options.

### Add dependencies

The Framework packages Python dependencies itself, with no plugin. List them in a `requirements.txt` file and add a `custom.pythonRequirements` block to `serverless.yml` to turn the packaging on:

```yaml
custom:
  pythonRequirements: {}
```

The deploy then installs the requirements into the Lambda package. `Pipfile` and `pyproject.toml` work too, with the configuration the [Python requirements guide](https://www.serverless.com/framework/docs/providers/aws/guide/python) describes.

## Cost and cleanup

While the example is deployed, Lambda bills each request and the function's compute time, and API Gateway bills each request. While nobody calls the API, neither bills anything. The function's logs stay in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, the API and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) for routes, authorizers and CORS.
- Route many paths through one function with [Flask](https://github.com/serverless/examples/tree/v4/aws-python-flask-api).
- Store data in DynamoDB with the [Flask and DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-python-flask-dynamodb-api).
