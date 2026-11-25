<!--
title: 'Next.js app on AWS Lambda Web Functions'
description: 'This example deploys a Next.js app to AWS Lambda Web Functions with the Serverless Framework, using the standalone server that next build writes. Pages, route handlers and static assets are all served from one public HTTPS endpoint.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Next.js app on AWS Lambda Web Functions

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-nextjs-web-app.svg)](https://github.com/serverless/examples/blob/verified/results.json)

This example deploys a [Next.js](https://nextjs.org/) 16 app to [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html) with one `webApps` entry in `serverless.yml`. A web function runs an HTTP server as it is, so the server that `next build` writes with `output: 'standalone'` runs unchanged: no adapter, no handler. Pages, route handlers and static assets are all served from one public HTTPS endpoint.

## What it deploys

- A Lambda web function, `aws-node-nextjs-web-app-<stage>-site`, that runs the Next.js standalone server on Node.js 24 and arm64, with a revision that holds the built app.
- A public HTTPS endpoint for the web function, `https://<id>.<cell>.lambda-web.<region>.on.aws`, that serves the page (`app/page.js`), the route handler at `/api/hello` (`app/api/hello/route.js`) and the files in `public/` and `.next/static/`.
- An IAM role for the web function, and two CloudWatch Logs log groups: `/aws/lambda/web/aws-node-nextjs-web-app-<stage>-site` and the same name ending in `.local`.

## Prerequisites

- [Node.js](https://nodejs.org/) 24 or later. Web functions run Node.js 24.
- The Serverless Framework CLI: `npm i -g serverless`. See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.

## Deploy

Install the dependencies, build the app, and deploy from this directory:

```bash
npm install
npm run build
serverless deploy
```

The deploy ships what is in `.next/standalone/`, so run `npm run build` again before every deploy: without it, a deploy ships the previous build.

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "aws-node-nextjs-web-app" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-nextjs-web-app-dev (51s)
endpoint: https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws
```

`endpoint` is the app's URL. `serverless info` prints it again later. The endpoint is public: anyone with the URL can open it.

## Try it

Open the URL the deploy printed in a browser to see the page, with its image and styles. The route handler answers JSON:

```bash
curl https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws/api/hello
```

```json
{"message":"Hello from a Next.js route handler!","time":"2026-11-25T22:13:39.682Z"}
```

The image the page shows comes from `public/`, served by the same server:

```bash
curl https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws/lambda.svg
```

```text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="12" fill="#fd5750"/>
  ...
```

`serverless invoke --web-app` sends the same request without the URL at hand, and prints the status, the headers and the body:

```bash
serverless invoke --web-app site --path /api/hello
```

```text
HTTP 200 OK
content-encoding: gzip
content-type: application/json
date: Wed, 25 Nov 2026 22:13:44 GMT
lambda-web-logstream: 2026/11/25/aws-node-nextjs-web-app-dev-site[rev-xxxxx]xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
lambda-web-request-id: XXXXXXXXXXXXXXXXXXXXXXXXXX
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding

{"message":"Hello from a Next.js route handler!","time":"2026-11-25T22:13:45.499Z"}
```

A status of 400 or above makes the command exit with code 1, so it also works as a check after a deploy.

## How it works

[`next.config.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-nextjs-web-app/next.config.mjs) sets [`output: 'standalone'`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output). `next build` then writes `.next/standalone/`: a `server.js` that starts the Next.js server, and only the files from `node_modules` that it needs. The standalone output leaves out `public/` and `.next/static/`, so the `build` script in [`package.json`](https://github.com/serverless/examples/blob/v4/aws-node-nextjs-web-app/package.json) copies them in, as the Next.js docs describe, and the server serves them itself:

```bash
next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
```

`next.config.mjs` also sets `outputFileTracingRoot` and `turbopack.root` to the project directory, so `server.js` lands at `.next/standalone/server.js` even when a parent directory has its own lockfile.

[`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-nextjs-web-app/serverless.yml) deploys that directory:

```yaml
webApps:
  site:
    entry: .next/standalone/server.js
    build: false
    package:
      patterns:
        - '!**'
        - '.next/standalone/**'
```

- `site` is the web app's name, and `entry` is the file that starts the server.
- `build: false` ships the built output as it is, without bundling it again.
- `package.patterns` puts only `.next/standalone/` in the deployed zip.

The Next.js server reads `PORT` and `HOSTNAME`. The Framework sets both from the address Lambda gives the server to listen on, before `server.js` starts.

On `serverless deploy`, the Framework uploads the zip to the deployment bucket and creates the web function, a revision that runs this code, the public endpoint, the stack output `SiteWebFunctionUrl` with the endpoint's URL, and the log groups the web function writes to. Lambda sends many concurrent requests to each execution environment, so keep per-request state in the request, not in module-level variables.

### Run it locally

`next dev` runs the app with hot reload on <http://localhost:3000>:

```bash
npm run dev
```

To run the production build that the deploy ships:

```bash
npm run build
npm start
curl http://localhost:3000/api/hello
```

### Develop with `serverless dev`

After the first deploy, `serverless dev` runs the app on your machine with its cloud context:

```bash
serverless dev
```

- Requests to the web app's real URL are answered by `next dev` on your machine, with the deployed environment variables and the web function's IAM role.
- The local URL that `serverless dev` prints under `web apps:` (`http://localhost:<port>`) serves the same server directly, with Next.js hot reload. On the real URL, refresh to see changes.
- When your machine doesn't answer (it sleeps, or you stop the session), the real URL serves the deployed build again.
- `dev.command` in `serverless.yml` is what `serverless dev` runs: `next dev` on the `PORT` the Framework sets, listening on `127.0.0.1` only. Without it, Dev Mode would try to run `entry`, which here is build output.

Stop the session with Ctrl+C: the real URL goes back to the deployed build. See [Dev Mode](https://www.serverless.com/framework/docs/providers/aws/guide/dev-mode#web-apps) for the details.

### Logs

`serverless logs --web-app` prints what the Next.js server writes, together with Lambda's own lines about starting it and serving requests:

```bash
serverless logs --web-app site
```

```text
{"timestamp":"2026-11-25T22:13:39.517Z","level":"INFO","message":"▲ Next.js 16.4.6","region":"us-east-1"}
{"timestamp":"2026-11-25T22:13:39.518Z","level":"INFO","message":"- Local:         http://localhost:3000","region":"us-east-1"}
{"timestamp":"2026-11-25T22:13:39.518Z","level":"INFO","message":"- Network:       http://0.0.0.0:3000","region":"us-east-1"}
{"timestamp":"2026-11-25T22:13:39.518Z","level":"INFO","message":"✓ Ready in 0ms","region":"us-east-1"}
{"timestamp":"2026-11-25T22:13:39.524Z","level":"INFO","type":"platform.initReport","region":"us-east-1","record":{"status":"success","revisionId":"rev-xxxxx","instanceId":"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx","initializationType":"native-http","metrics":{"totalDurationMs":584.000,"totalCpuTimeMs":341.000,"maxMemoryUsageMb":170}}}
```

Add `--tail` to follow new lines as they arrive.

## Cost and cleanup

While the example is deployed, Lambda bills each request to the web function, the CPU time the server uses, and the memory each execution environment uses while it runs. CloudWatch Logs bills for the log data it stores, and Amazon S3 for the uploaded code in the deployment bucket. See [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/) and [S3 pricing](https://aws.amazon.com/s3/pricing/). Remove the stack, with the web function, its endpoint, its role and its log groups, when you are done:

```bash
serverless remove
```

```text
Removing "aws-node-nextjs-web-app" from stage "dev" (us-east-1)
✔ Service aws-node-nextjs-web-app has been successfully removed (28s)
```

## Next steps

- Read the [Web Apps docs](https://www.serverless.com/framework/docs/providers/aws/guide/web-apps) for TypeScript, environment variables, IAM, VPC access, scaling limits and IAM-authorized endpoints.
- Deploy a plain Node.js server with the [Express web app example](https://github.com/serverless/examples/tree/v4/aws-node-express-web-app).
- Serve a frontend and an API from one domain with the [web apps on a custom domain example](https://github.com/serverless/examples/tree/v4/aws-node-web-app-custom-domain).
- Read how Next.js builds the [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) and what it leaves out.
