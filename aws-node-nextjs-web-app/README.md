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

This example deploys a [Next.js](https://nextjs.org/) app to [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html). A web function runs an HTTP server as it is, so the Next.js production server runs unchanged: no adapter, no handler.

The app has a page (`app/page.js`), a route handler at `/api/hello` (`app/api/hello/route.js`) and an image in `public/`.

## How it works

[`next.config.mjs`](next.config.mjs) sets [`output: 'standalone'`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output). `next build` then writes `.next/standalone/`: a `server.js` that starts the Next.js server, and only the files from `node_modules` that it needs. The standalone output leaves out `public/` and `.next/static/`, so the `build` script in `package.json` copies them in, as the Next.js docs describe, and the server serves them itself:

```bash
next build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
```

`next.config.mjs` also sets `outputFileTracingRoot` and `turbopack.root` to the project directory, so `server.js` lands at `.next/standalone/server.js` even when a parent directory has its own lockfile.

[`serverless.yml`](serverless.yml) deploys that directory:

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

- `entry` is the file that starts the server.
- `build: false` ships the built output as it is, without bundling it again.
- `package.patterns` puts only `.next/standalone/` in the deployed zip.

The Next.js server reads `PORT` and `HOSTNAME`. The Framework sets both from the address the runtime gives the server to listen on, before `server.js` starts.

On `serverless deploy`, the Framework uploads the zip to the deployment bucket and creates the web function, a revision that runs this code, a public HTTPS endpoint, and the log groups the web function writes to, `/aws/lambda/web/aws-node-nextjs-web-app-<stage>-site` and the same name ending in `.local`.

## Requirements

- Node.js 24. Web functions run Node.js 24.
- AWS credentials, and a Serverless Framework sign-in (`serverless login`).

## Develop locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. To run the production build locally:

```bash
npm run build
npm start
```

## Build and deploy

Build first. The deploy ships what is in `.next/standalone/`, so run the build again before every deploy:

```bash
npm install
npm run build
serverless deploy
```

```text
Deploying "aws-node-nextjs-web-app" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-nextjs-web-app-dev (60s)
endpoint: https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws
```

`endpoint` is the app's URL. `serverless info` prints it again later. The endpoint is public: anyone with the URL can open it.

## Call the app

Open the URL in a browser to see the page, with its image and styles. The route handler answers JSON:

```bash
curl https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws/api/hello
```

```json
{ "message": "Hello from a Next.js route handler!", "time": "2026-10-15T07:09:36.742Z" }
```

`serverless invoke --web-app` sends the same request without the URL at hand, and prints the status and headers before the body:

```bash
serverless invoke --web-app site --path /api/hello
```

```text
HTTP 200 OK
content-type: application/json
date: Thu, 15 Oct 2026 08:35:17 GMT
lambda-web-logstream: 2026/10/15/aws-node-nextjs-web-app-dev-site[rev-54poo]85e4e4348714497c8eb5377b7ff32bf7
lambda-web-request-id: RPZDQOULNKAB7NVDSZXVYLO3S4
transfer-encoding: chunked
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch

{"message":"Hello from a Next.js route handler!","time":"2026-10-15T08:35:17.826Z"}
```

A status of 400 or above makes the command exit with code 1, so it also works as a check after a deploy.

## Logs

`serverless logs --web-app` prints what the Next.js server writes, together with Lambda's own lines about starting it and serving requests:

```bash
serverless logs --web-app site
```

```text
{"timestamp":"2026-10-16T19:01:54.955Z","level":"INFO","message":"▲ Next.js 16.4.0","region":"us-east-1"}
{"timestamp":"2026-10-16T19:01:54.958Z","level":"INFO","message":"- Local:         http://localhost:3000","region":"us-east-1"}
{"timestamp":"2026-10-16T19:01:54.958Z","level":"INFO","message":"- Network:       http://0.0.0.0:3000","region":"us-east-1"}
{"timestamp":"2026-10-16T19:01:54.958Z","level":"INFO","message":"✓ Ready in 0ms","region":"us-east-1"}
```

## Remove

```bash
serverless remove
```

This deletes the stack, with the web function, its endpoint and its log groups, and the uploaded code.
