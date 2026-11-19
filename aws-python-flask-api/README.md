<!--
title: 'Python Flask API on AWS'
description: 'This template demonstrates how to develop and deploy a simple Python Flask API running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: Python
priority: 7
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Python Flask API on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-python-flask-api.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys a [Flask](https://flask.palletsprojects.com/) application to AWS Lambda behind an API Gateway REST API. One function receives every request, and Flask routes it. Use it to run a Flask API without managing servers.

## What it deploys

- An API Gateway REST API that sends every path and method to one function.
- A Lambda function, `api`, that runs the Flask application.
- An IAM role for the function and a CloudWatch Logs log group for its logs.

## Prerequisites

- [Python](https://www.python.org/) 3.14 on your `PATH`: the deploy runs it to package the dependencies in `requirements.txt`.
- [Node.js](https://nodejs.org/), to install the Serverless Framework CLI (`npm i -g serverless`) and the `serverless-wsgi` plugin. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the plugin and deploy from this directory:

```bash
npm install
serverless deploy
```

You should see output like this:

```text
Deploying "aws-python-flask-api" to stage "dev" (us-east-1)
✔ Service deployed to stack aws-python-flask-api-dev (53s)
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}

functions:
  api: aws-python-flask-api-dev-api (655 kB)
```

The deploy prints the endpoint URLs, which end in the stage name: `https://<api-id>.execute-api.<region>.amazonaws.com/dev/` for the default `dev` stage.

## Try it

Call the root path with the URL the deploy printed:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

Flask answers with status 200 and this body:

```json
{"message":"Hello from root!"}
```

The `/hello` path answers `{"message":"Hello from path!"}`, and any other path answers status 404 with `{"error":"Not found!"}`.

## How it works

`serverless.yml` sends the root path and every other path to the `api` function, and points the `serverless-wsgi` plugin at the Flask application:

```yaml
custom:
  wsgi:
    app: app.app
    packRequirements: false
  pythonRequirements: {}

functions:
  api:
    handler: wsgi_handler.handler
    events:
      - http:
          path: /
          method: ANY
      - http:
          path: /{proxy+}
          method: ANY

plugins:
  - serverless-wsgi
```

[`serverless-wsgi`](https://github.com/logandk/serverless-wsgi) adds `wsgi_handler.handler`, which turns each Lambda event into a WSGI request for the application named in `custom.wsgi.app`. The Framework's built-in [Python requirements packaging](https://www.serverless.com/framework/docs/providers/aws/guide/python), turned on by `custom.pythonRequirements`, bundles the dependencies in `requirements.txt`. `packRequirements: false` leaves that work to the Framework instead of the plugin.

`app.py` is an ordinary Flask application:

```python
app = Flask(__name__)


@app.route("/")
def hello_from_root():
    return jsonify(message='Hello from root!')


@app.route("/hello")
def hello():
    return jsonify(message='Hello from path!')
```

Add routes to the Flask application as usual; `serverless.yml` does not change. After the deploy, the API is public and anyone can call it. To restrict access, configure an authorizer, as the [REST API event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway) describe.

### Run it locally

`serverless-wsgi` can serve the application on your machine. Install `werkzeug` and the requirements first, preferably in a virtual environment:

```bash
pip install werkzeug
pip install -r requirements.txt
serverless wsgi serve
```

The plugin's [GitHub repository](https://github.com/logandk/serverless-wsgi) describes its other local commands.

## Cost and cleanup

While the example is deployed, Lambda bills each request and the function's compute time, and API Gateway bills each request. While nobody calls the API, neither bills anything. The function's logs stay in CloudWatch Logs, which bills for the log data it stores. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the function, the API and the log group, when you are done:

```bash
serverless remove
```

## Next steps

- Read the [REST API event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway) for paths, authorizers and CORS.
- Store data in DynamoDB with the [Flask and DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-python-flask-dynamodb-api).
- Compare with a single-route API in the [Python HTTP API example](https://github.com/serverless/examples/tree/v4/aws-python-http-api).
