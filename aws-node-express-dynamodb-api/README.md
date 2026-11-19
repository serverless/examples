<!--
title: 'Node Express API service backed by DynamoDB on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API service backed by DynamoDB running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 3
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node Express API with DynamoDB on AWS

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-express-dynamodb-api.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This template deploys an [Express](https://expressjs.com/) API on AWS Lambda that stores users in a DynamoDB table. It exposes `POST /users` to create a user and `GET /users/:userId` to read one back. Use it as the starting point for an API that keeps data.

## What it deploys

- An API Gateway HTTP API that sends every path and method to one function.
- A Lambda function, `api`, that runs the Express application.
- A DynamoDB table, `users-table-<stage>`, with on-demand capacity.
- An IAM role that lets the function read and write that table, and a CloudWatch Logs log group for the function's logs.

## Prerequisites

- [Node.js](https://nodejs.org/) 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the dependencies and deploy from this directory:

```bash
npm install
serverless deploy
```

The deploy prints the endpoint URL, `https://<api-id>.execute-api.<region>.amazonaws.com`.

## Try it

Create a user with the URL the deploy printed:

```bash
curl --request POST 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/users' \
  --header 'Content-Type: application/json' \
  --data-raw '{"name": "John", "userId": "someUserId"}'
```

The API stores the user and answers with it:

```json
{"userId":"someUserId","name":"John"}
```

Read the user back by its `userId`:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/users/someUserId
```

The API answers with the stored user:

```json
{"userId":"someUserId","name":"John"}
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
        BillingMode: PAY_PER_REQUEST
        TableName: ${param:tableName}
```

A catch-all `httpApi: "*"` event sends every request to the `api` function. `handler.js` is an Express application wrapped with [`serverless-http`](https://github.com/dougmoscrop/serverless-http), and it reads and writes the table with the AWS SDK for JavaScript v3:

```javascript
app.get("/users/:userId", async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { userId, name } = Item;
      res.json({ userId, name });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});
```

After the deploy, the API is public and anyone can call it. To restrict access, configure an authorizer, as the [HTTP API event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api) describe.

### Develop with Dev Mode

Start a Dev Mode session:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine. Call your API as before, and your local code runs, with the function's deployed configuration and permissions, against the real DynamoDB table. Edit the code, and the next request runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; the function runs the deployed code again. Run `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).

## Cost and cleanup

While the example is deployed, Lambda bills each request and the function's compute time, API Gateway bills each request, and the on-demand DynamoDB table bills each read and write. While nobody calls the API, none of them bills for requests. The table also bills for the data it stores, and the users you create stay in it until you remove the stack; the function's logs stay in CloudWatch Logs, which bills for stored log data. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/), [DynamoDB pricing](https://aws.amazon.com/dynamodb/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). `serverless remove` deletes the table with its data, the function, the API and the log group:

```bash
serverless remove
```

To keep the table when you remove the stack, add `DeletionPolicy: Retain` to its resource definition.

## Next steps

- Read the [AWS resources guide](https://www.serverless.com/framework/docs/providers/aws/guide/resources) to add other CloudFormation resources the same way.
- Compare with the same API in Python in the [Flask and DynamoDB example](https://github.com/serverless/examples/tree/v4/aws-python-flask-dynamodb-api).
- Start without a database from the [Express API example](https://github.com/serverless/examples/tree/v4/aws-node-express-api).
