<!--
title: 'Python Flask API backed by DynamoDB on AWS'
description: 'This template demonstrates how to develop and deploy a simple Python Flask API service backed by DynamoDB running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: Python
priority: 8
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Python Flask API with DynamoDB on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-python-flask-dynamodb-api.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys a [Flask](https://flask.palletsprojects.com/) API on AWS Lambda that stores users in a DynamoDB table. It exposes `POST /users` to create a user and `GET /users/{userId}` to read one back. Use it as the starting point for a Python API that keeps data.

## What it deploys

- An API Gateway REST API that sends every path and method to one function.
- A Lambda function, `api`, that runs the Flask application.
- A DynamoDB table, `users-table-<stage>`, with provisioned capacity of one read and one write unit.
- An IAM role that lets the function read and write that table, and a CloudWatch Logs log group for the function's logs.

## Prerequisites

- [Python](https://www.python.org/) 3.15 on your `PATH`: the deploy runs it to package the dependencies in `requirements.txt`. To package them inside a Docker container instead, set the `dockerizePip` option under `custom.pythonRequirements` in `serverless.yml`.
- [Node.js](https://nodejs.org/), to install the Serverless Framework CLI (`npm i -g serverless`) and the `serverless-wsgi` plugin. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the plugin and deploy from this directory:

```bash
npm install
serverless deploy
```

With npm 12 or later, `npm install` ends with a warning that it blocked the install script of `es5-ext`, a dependency of the plugin. That script only prints a message, so the example needs nothing from it.

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-python-flask-dynamodb-api" to stage "dev" (us-east-1)
Using Python specified in "runtime": python3.15
Packaging Python WSGI handler...
✔ Service deployed to stack aws-python-flask-dynamodb-api-dev (66s)
endpoints:
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
  ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}

functions:
  api: aws-python-flask-dynamodb-api-dev-api (658 kB)
```

The deploy prints the endpoint URLs, which end in the stage name: `https://<api-id>.execute-api.<region>.amazonaws.com/dev/` for the default `dev` stage.

## Try it

Create a user with the URL the deploy printed:

```bash
curl --request POST 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{"name": "John", "userId": "someUserId"}'
```

The API stores the user and answers with it:

```json
{"name":"John","userId":"someUserId"}
```

Read the user back by its `userId`:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/users/someUserId
```

The API answers with the stored user:

```json
{"name":"John","userId":"someUserId"}
```

A `userId` that does not exist answers status 404 with `{"error":"Could not find user with provided \"userId\""}`.

## How it works

`serverless.yml` defines the table as a CloudFormation resource, names it per stage with a parameter, passes the name to the function in an environment variable, and allows the function to use it:

```yaml
stages:
  default:
    params:
      tableName: "users-table-${sls:stage}"

provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource:
            - Fn::GetAtt: [UsersTable, Arn]
  environment:
    USERS_TABLE: ${param:tableName}

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${param:tableName}
```

Two `http` events, `/` and `/{proxy+}` with method `ANY`, send every request to the `api` function. [`serverless-wsgi`](https://github.com/logandk/serverless-wsgi) adds the `wsgi_handler.handler` entry point, which turns each Lambda event into a WSGI request for the Flask application named in `custom.wsgi.app`. The Framework's built-in [Python requirements packaging](https://www.serverless.com/framework/docs/providers/aws/guide/python), turned on by `custom.pythonRequirements`, bundles the dependencies in `requirements.txt`.

`app.py` reads and writes the table with `boto3`:

```python
@app.route('/users/<string:user_id>')
def get_user(user_id):
    result = dynamodb_client.get_item(
        TableName=USERS_TABLE, Key={'userId': {'S': user_id}}
    )
    item = result.get('Item')
    if not item:
        return jsonify({'error': 'Could not find user with provided "userId"'}), 404

    return jsonify(
        {'userId': item.get('userId').get('S'), 'name': item.get('name').get('S')}
    )
```

After the deploy, the API is public and anyone can call it. To restrict access, configure an authorizer, as the [REST API event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway) describe.

### Run it locally

`serverless-wsgi` can serve the application on your machine, against a local DynamoDB. Install `werkzeug`, `boto3` and the requirements first, in a virtual environment:

```bash
python3.15 -m venv ./venv
source ./venv/bin/activate
pip install werkzeug boto3
pip install -r requirements.txt
```

Emulate DynamoDB with the [`serverless-dynamodb`](https://github.com/raisenational/serverless-dynamodb) plugin, the maintained fork of `serverless-dynamodb-local`. These commands add the plugin to `devDependencies` in `package.json` and to `plugins` in `serverless.yml`, and install DynamoDB locally:

```bash
serverless plugin install -n serverless-dynamodb
serverless dynamodb install
```

Add its configuration to the `custom` section of `serverless.yml`, so it creates the table on start:

```yaml
custom:
  dynamodb:
    start:
      migrate: true
    stages:
      - dev
```

The virtual environment and the local DynamoDB files (`.dynamodb/`) stay out of the deployed package: the `package` section of `serverless.yml` excludes them, as [Keep local environments out of the package](https://www.serverless.com/framework/docs/providers/aws/guide/python#keep-local-environments-out-of-the-package) describes.

`app.py` already connects to the local DynamoDB when `serverless-wsgi` sets the `IS_OFFLINE` environment variable:

```python
if os.environ.get('IS_OFFLINE'):
    dynamodb_client = boto3.client(
        'dynamodb', region_name='localhost', endpoint_url='http://localhost:8000'
    )
```

Start DynamoDB, then serve the application:

```bash
serverless dynamodb start
serverless wsgi serve
```

The [`serverless-wsgi`](https://github.com/logandk/serverless-wsgi) and [`serverless-dynamodb`](https://github.com/raisenational/serverless-dynamodb) repositories describe the other local options.

## Cost and cleanup

While the example is deployed, Lambda bills each request and the function's compute time, and API Gateway bills each request. The DynamoDB table uses provisioned capacity, one read and one write unit, which is billed by the hour while the table exists, whether or not you use it. The table also bills for the data it stores, and the users you create stay in it until you remove the stack, and so do the function's logs in CloudWatch Logs, which bills for stored log data. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/), [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). `serverless remove` deletes the table with its data, the function, the API and the log group:

```bash
serverless remove
```

To keep the table when you remove the stack, add `DeletionPolicy: Retain` to its resource definition.

## Next steps

- Read the [AWS resources guide](https://www.serverless.com/framework/docs/providers/aws/guide/resources) to add other CloudFormation resources the same way.
- Compare with the same API in Node.js in the [Express and DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-node-express-dynamodb-api).
- Start without a database from the [Flask API example](https://github.com/serverless/examples/tree/v4/aws-python-flask-api).
