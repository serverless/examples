<!--
title: 'Node.js AWS Lambda connecting to MongoDB Atlas'
description: 'Shows how to connect AWS Lambda to MongoDB Atlas.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/welkie'
authorName: 'Matt Welke'
authorAvatar: 'https://avatars0.githubusercontent.com/u/7719209'
-->
# aws-node-mongodb-atlas

An example app, created in this [blog post](https://mattwelke.com/2019/02/18/free-tier-serverless-mongodb-with-aws-lambda-and-mongodb-atlas.html), showing how to connect AWS Lambda to MongoDB Atlas, which must be configured with a user with read/write privileges and an IP whitelist to allow Lambda to connect to it. See blog post for detailed walkthrough setting up MongoDB Atlas.

The MongoDB connection is cached at module scope so warm Lambda invocations reuse it instead of reconnecting on every request.

## Setup

1. Set the `MONGODB_URI` environment variable in `serverless.yml` to your MongoDB Atlas connection string.

    ```yml
    provider:
      environment:
        MONGODB_URI: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true
    ```

2. Install the dependencies and deploy

    ```bash
    npm install
    serverless deploy
    ```

## Usage

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/hello
```

```json
{
  "insertedPet": { "type": "cat", "name": "Jane Doe" },
  "mongoResult": { "acknowledged": true, "insertedId": "..." }
}
```
