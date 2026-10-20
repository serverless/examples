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

This example deploys an [Express](https://expressjs.com/) 5 server to [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html). A web function runs your HTTP server as it is: [`src/server.js`](src/server.js) creates an Express app and calls `app.listen(process.env.PORT ?? 3000)`, with no handler and no adapter, so the same file runs on your machine and in AWS.

The whole configuration is one `webApps` entry:

```yaml
webApps:
  api:
    entry: src/server.js
```

`entry` is the file that starts your server. On `serverless deploy`, the Framework:

- zips the service directory, with the production dependencies from `node_modules`, and uploads it to the deployment bucket;
- creates the web function, a revision that runs this code, and a public HTTPS endpoint for it;
- sets `PORT` and `HOSTNAME` from the address the runtime gives the server to listen on, before your code starts;
- creates the log groups the web function writes to, `/aws/lambda/web/aws-node-express-web-app-<stage>-api` and the same name ending in `.local`.

The server answers three routes:

| Route | Response |
| --- | --- |
| `GET /` | `{"message":"Hello from Express on AWS Lambda Web Functions!"}` |
| `GET /hello/:name` | `{"message":"Hello, <name>!"}` |
| `GET /health` | `{"status":"ok"}` |

## Requirements

- Node.js 24. Web functions run Node.js 24.
- AWS credentials, and a Serverless Framework sign-in (`serverless login`).

## Run it locally

```bash
npm install
npm start
```

The server listens on port 3000:

```bash
curl http://localhost:3000/health
```

```json
{ "status": "ok" }
```

## Deploy

```bash
serverless deploy
```

```text
Deploying "aws-node-express-web-app" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-express-web-app-dev (51s)
endpoint: https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws
```

`endpoint` is the web app's URL. `serverless info` prints it again later. The endpoint is public: anyone with the URL can call it.

## Call the app

```bash
curl https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws/hello/serverless
```

```json
{ "message": "Hello, serverless!" }
```

`serverless invoke --web-app` sends a request to the web app without the URL at hand, and prints the status, the headers and the body:

```bash
serverless invoke --web-app api --path /health
```

```text
HTTP 200 OK
content-length: 15
content-type: application/json; charset=utf-8
date: Thu, 15 Oct 2026 08:35:16 GMT
etag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
lambda-web-logstream: 2026/10/15/aws-node-express-web-app-dev-api[rev-yuqer]dbda8e7bbdc74f8694d1f19dfaff2990
lambda-web-request-id: RDG5RQS3KAYQEA2CTWUPVK2774
x-powered-by: Express

{"status":"ok"}
```

The status line and headers go to standard error and the body to standard output, so `serverless invoke --web-app api --path /health | jq` sees the JSON alone. A status of 400 or above makes the command exit with code 1, so it also works as a health check after a deploy.

Edit `src/server.js` and run `serverless deploy` again to publish the change. A deploy with no changes to the code or configuration is skipped.

## Logs

The server's output goes to CloudWatch Logs. `serverless logs --web-app` prints it, together with Lambda's own lines about starting the server and serving requests:

```bash
serverless logs --web-app api
serverless logs --web-app api --tail
```

```text
{"timestamp":"2026-10-15T08:35:16.370Z","level":"INFO","message":"Listening on port 3000","region":"us-east-1"}
{"timestamp":"2026-10-15T08:35:16.375Z","level":"INFO","type":"platform.initReport","region":"us-east-1","record":{"status":"success","instanceId":"d6a20bdb-df41-455a-8c4b-b0df43ebf406","initializationType":"native-http","metrics":{"totalDurationMs":390.000,"totalCpuTimeMs":210.000,"maxMemoryUsageMb":154}}}
```

## Remove

```bash
serverless remove
```

This deletes the stack, with the web function, its endpoint and its log groups, and the uploaded code.
