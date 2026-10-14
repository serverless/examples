<!--
title: 'AWS NodeJS Example'
description: 'This template demonstrates how to deploy a simple NodeJS function running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework AWS NodeJS Example

This template demonstrates how to deploy a simple NodeJS function running on AWS Lambda using the Serverless Framework. The deployed function does not include any event definitions or any kind of persistence (database). For more advanced configurations check out the [examples repo](https://github.com/serverless/examples/) which include use cases like API endpoints, workers triggered by SQS, persistence with DynamoDB, and scheduled tasks. For details about configuration of specific events, please refer to our [documentation](https://www.serverless.com/framework/docs/providers/aws/events/).

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "aws-node" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-dev (90s)

functions:
  hello: aws-node-dev-hello (1.5 kB)
```

### Invocation

After successful deployment, you can invoke the deployed function by using the following command:

```
serverless invoke --function hello
```

Which should result in response similar to the following:

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"Go Serverless v4.0! Your function executed successfully!\"}"
}
```

### Local development

The easiest way to develop and test your function is to use the Serverless Framework's `dev` command:

```bash
serverless dev
```

Dev Mode attaches your deployed function to your machine: invoke the function as before, and your local code runs, with your function's deployed configuration and permissions. Edit the code and the next invocation runs the new version, with nothing to redeploy.

Press Ctrl+C to end the session; your function runs the deployed code again. Deploy with `serverless deploy` when you want your changes to stay. Learn more in the [Dev Mode guide](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode).
