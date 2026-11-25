<!--
title: 'Express web app on AWS Lambda Web Functions'
description: 'This example deploys a plain Express server to AWS Lambda Web Functions with the Serverless Framework. The server has no Lambda-specific code and answers on a public HTTPS endpoint.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Express web app on AWS Lambda Web Functions

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-express-web-app.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This example deploys an [Express](https://expressjs.com/) 5 server to [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html) with one `webApps` entry in `serverless.yml`. A web function runs your HTTP server as it is: [`src/server.js`](https://github.com/serverless/examples/blob/v4/aws-node-express-web-app/src/server.js) creates an Express app and calls `app.listen(process.env.PORT ?? 3000)`, with no handler and no adapter, so the same file runs on your machine and in AWS.

## What it deploys

- A Lambda web function, `aws-node-express-web-app-<stage>-api`, that runs the Express server on Node.js 24 and arm64, with a revision that holds this code.
- A public HTTPS endpoint for the web function, `https://<id>.<cell>.lambda-web.<region>.on.aws`.
- An IAM role for the web function, and two CloudWatch Logs log groups: `/aws/lambda/web/aws-node-express-web-app-<stage>-api` and the same name ending in `.local`.

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or later. Web functions run Node.js 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the dependencies and deploy from this directory:

```bash
npm install
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-node-express-web-app" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-express-web-app-dev (49s)
endpoint: https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws
```

`endpoint` is the web app's URL. `serverless info` prints it again later. The endpoint is public: anyone with the URL can call it.

## Try it

Call the `/hello/:name` route with the URL the deploy printed:

```bash
curl https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws/hello/serverless
```

Express answers with status 200 and this body:

```json
{"message":"Hello, serverless!"}
```

The server answers three routes:

| Route | Response |
| --- | --- |
| `GET /` | `{"message":"Hello from Express on AWS Lambda Web Functions!"}` |
| `GET /hello/:name` | `{"message":"Hello, <name>!"}` |
| `GET /health` | `{"status":"ok"}` |

`serverless invoke --web-app` sends the same request without the URL at hand, and prints the status, the headers and the body:

```bash
serverless invoke --web-app api --path /hello/serverless
```

```text
HTTP 200 OK
content-length: 32
content-type: application/json; charset=utf-8
date: Wed, 25 Nov 2026 21:57:13 GMT
etag: W/"20-iauLf21YNtkc/qCizlfTPLAhpMc"
lambda-web-logstream: 2026/11/25/aws-node-express-web-app-dev-api[rev-xxxxx]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
lambda-web-request-id: XXXXXXXXXXXXXXXXXXXXXXXXXX
x-powered-by: Express

{"message":"Hello, serverless!"}
```

The status line and headers go to standard error and the body to standard output, so `serverless invoke --web-app api --path /health | jq` sees the JSON alone. A status of 400 or above makes the command exit with code 1, so it also works as a health check after a deploy.

## How it works

The whole configuration is one `webApps` entry in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-express-web-app/serverless.yml):

```yaml
webApps:
  api:
    entry: src/server.js
```

`api` is the web app's name, and `entry` is the file that starts your server. On `serverless deploy`, the Framework:

- zips the service directory, with the production dependencies from `node_modules`, and uploads it to the deployment bucket;
- adds a start file to the package that sets `PORT` and `HOSTNAME` from the address Lambda gives the server to listen on, then starts `entry`;
- creates the web function, a revision that runs this code, the public endpoint, and the stack output `ApiWebFunctionUrl` with the endpoint's URL;
- creates the log groups the web function writes to.

`src/server.js` is an ordinary Express server. It reads the port from `PORT`, which the start file sets, and listens without naming a host:

```javascript
import express from 'express'

const app = express()

app.get('/hello/:name', (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` })
})

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
```

Lambda sends many concurrent requests to each execution environment, so keep per-request state in the request, not in module-level variables. The server must start listening within 10 seconds of starting. Edit `src/server.js` and run `serverless deploy` again to publish a change: the new revision serves the same URL. A deploy with no changes to the code or configuration is skipped.

### Run it locally

The same file runs on your machine:

```bash
npm start
curl http://localhost:3000/health
```

```json
{"status":"ok"}
```

### Logs

The server's output goes to CloudWatch Logs. `serverless logs --web-app` prints it, together with Lambda's own lines about starting the server and serving requests:

```bash
serverless logs --web-app api
```

```text
{"timestamp":"2026-11-25T21:57:07.999Z","level":"INFO","message":"Listening on port 3000","region":"us-east-1"}
{"timestamp":"2026-11-25T21:57:08.005Z","level":"INFO","type":"platform.initReport","region":"us-east-1","record":{"status":"success","revisionId":"rev-xxxxx","instanceId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx","initializationType":"native-http","metrics":{"totalDurationMs":339.000,"totalCpuTimeMs":294.000,"maxMemoryUsageMb":155}}}
```

Add `--tail` to follow new lines as they arrive.

## Cost and cleanup

While the example is deployed, Lambda bills each request to the web function, the CPU time the server uses, and the memory each execution environment uses while it runs. CloudWatch Logs bills for the log data it stores, and Amazon S3 for the uploaded code in the deployment bucket. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/) and [S3 pricing](https://aws.amazon.com/s3/pricing/). Remove the stack, with the web function, its endpoint, its role and its log groups, when you are done:

```bash
serverless remove
```

```text
Removing "aws-node-express-web-app" from stage "dev" (us-east-1)
✔ Service aws-node-express-web-app has been successfully removed (28s)
```

## Next steps

- Read the [Web Apps docs](https://www.serverless.com/framework/docs/providers/aws/guide/web-apps) for TypeScript, environment variables, IAM, VPC access, scaling limits and IAM-authorized endpoints.
- Deploy a Next.js app from its standalone output with the [Next.js web app example](https://github.com/serverless/examples/tree/v4/aws-node-nextjs-web-app).
- Serve a frontend and an API from one domain with the [web apps on a custom domain example](https://github.com/serverless/examples/tree/v4/aws-node-web-app-custom-domain).
- Serve requests to the deployed URL from your working copy with [Dev Mode](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode#web-apps).
