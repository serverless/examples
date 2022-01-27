<!--
title: 'Serverless Framework Node Express API on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API running on AWS Lambda using the traditional Serverless Framework.'
layout: Doc
framework: v3
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node Express API on AWS

This template demonstrates how to develop and deploy a simple Node Express API service running on AWS Lambda using the traditional Serverless Framework.

## Anatomy of the template

This template configures a single function, `api`, which is responsible for handling all incoming requests thanks to the `httpApi` event. To learn more about `httpApi` event configuration options, please refer to [httpApi event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/). As the event is configured in a way to accept all incoming requests, `express` framework is responsible for routing and handling requests internally. Implementation takes advantage of `serverless-http` package, which allows you to wrap existing `express` applications. To learn more about `serverless-http`, please refer to corresponding [GitHub repository](https://github.com/dougmoscrop/serverless-http).

## Usage

### Deployment

Install dependencies with:

```
npm install
```

and then deploy with:

```
serverless deploy
```

After running deploy, you should see output similar to:

```bash
Deploying aws-node-express-api-project to stage dev (us-east-1)

✔ Service deployed to stack aws-node-express-api-project-dev (196s)

endpoint: ANY - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com
functions:
  api: aws-node-express-api-project-dev-api (766 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [`httpApi` event docs](https://www.serverless.com/framework/docs/providers/aws/events/http-api/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in the following response:

```
{"message":"Hello from root!"}
```

Calling the `/hello` path with:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/hello
```

Should result in the following response:

```bash
{"message":"Hello from path!"}
```

If you try to invoke a path or method that does not have a configured handler, e.g. with:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/nonexistent
```

You should receive the following response:

```bash
{"error":"Not Found"}
```

### Local development

It is also possible to emulate API Gateway and Lambda locally by using `serverless-offline` plugin. In order to do that, execute the following command:

```bash
serverless plugin install -n serverless-offline
```

It will add the `serverless-offline` plugin to `devDependencies` in `package.json` file as well as will add it to `plugins` in `serverless.yml`.

After installation, you can start local emulation with:

```
serverless offline
```

To learn more about the capabilities of `serverless-offline`, please refer to its [GitHub repository](https://github.com/dherault/serverless-offline).
