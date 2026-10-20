<!--
title: 'Next.js and Express web apps on one custom domain'
description: 'This example deploys a Next.js frontend and an Express API to AWS Lambda Web Functions with the Serverless Framework and serves both from one custom domain, routed by path.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Next.js and Express web apps on one custom domain

This example deploys two web apps to [AWS Lambda Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html) and serves them from one hostname of your own:

- `web`, a [Next.js](https://nextjs.org/) frontend in [`web/`](web), answers every path except `/api`.
- `api`, an [Express](https://expressjs.com/) 5 API in [`api/`](api), answers `/api` and every path under `/api/`.

The page fetches `/api/hello` from the domain that served it, so the browser talks to one origin and the request reaches the Express app. Neither app has Lambda-specific code, and the API needs no CORS configuration.

## How it works

[`serverless.yml`](serverless.yml) adds two `provider.domains` entries for the same hostname:

```yaml
provider:
  name: aws
  domains:
    - name: ${param:domain}
      webApp: web
    - name: ${param:domain}
      basePath: api
      webApp: api

webApps:
  web:
    entry: web/.next/standalone/server.js
    build: false
    package:
      patterns:
        - '!**'
        - 'web/.next/standalone/**'
  api:
    entry: api/server.js
    package:
      patterns:
        - '!**'
        - 'api/**'
```

- The entry without `basePath` receives every path the other entry doesn't match.
- The entry with `basePath: api` receives `/api` and every path under `/api/`. The path reaches the web app unchanged: a request for `/api/hello` arrives as `/api/hello`, so [`api/server.js`](api/server.js) mounts its routes under `/api`.
- `${param:domain}` is the hostname, a [stage parameter](https://www.serverless.com/framework/docs/guides/parameters) you set at deploy time.

For the hostname, the Framework creates an Amazon CloudFront distribution in front of the two web apps and Route 53 A and AAAA alias records that point the hostname at it. On the first deploy it uses an ACM certificate in us-east-1, CloudFront's certificate Region, that covers the hostname, such as an existing wildcard certificate, or requests one and validates it through DNS in the hosted zone; later deploys reuse it. Requests to the hostname aren't cached: every request reaches a web app.

Each web app is packaged on its own:

- `web` ships the Next.js [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) as it is. The `build` script in [`web/package.json`](web/package.json) runs `next build` and copies `public/` and `.next/static/` into `.next/standalone/`, and [`web/next.config.mjs`](web/next.config.mjs) pins `outputFileTracingRoot` and `turbopack.root` to `web/`, so the server lands at `web/.next/standalone/server.js`.
- `api` ships `api/server.js` with its production dependencies from `api/node_modules`.

The Express app reads the public hostname from the `X-Forwarded-Host` header and returns it, which shows that the request came through the domain.

## Requirements

- Node.js 24. Web functions run Node.js 24.
- AWS credentials, and a Serverless Framework sign-in (`serverless login`).
- A domain whose DNS is a Route 53 public hosted zone in the same AWS account, for example `example.com`. The hostname can be the zone's name or any name under it, such as `app.example.com`.

## Develop locally

Install both apps:

```bash
(cd api && npm install)
(cd web && npm install)
```

Start the API in one terminal; it listens on port 3001:

```bash
cd api && npm start
```

Start the Next.js dev server in another:

```bash
cd web && npm run dev
```

Open <http://localhost:3000>. In `next dev`, `next.config.mjs` rewrites `/api/*` to the API on port 3001, as the domain routes it once deployed.

## Build and deploy

Build the frontend first. The deploy ships what is in `web/.next/standalone/`, so run the build again before every deploy:

```bash
(cd api && npm install)
(cd web && npm install && npm run build)
serverless deploy --param="domain=app.example.com"
```

Replace `app.example.com` with your hostname. To keep the hostname in the configuration instead, set it per stage:

```yaml
stages:
  dev:
    params:
      domain: dev.example.com
```

The first deploy with a new hostname takes several minutes, mostly while CloudFront creates the distribution and, if no certificate covers the hostname yet, while ACM issues one. Later deploys update the distribution in place.

```text
Deploying "aws-node-web-app-custom-domain" to stage "dev" (us-east-1)

✔ Service deployed to stack aws-node-web-app-custom-domain-dev (267s)
endpoints:
  web: https://xxxxxxxxxxxxxxxx.xxx.lambda-web.us-east-1.on.aws
  web: https://app.example.com
  api: https://yyyyyyyyyyyyyyyy.xxx.lambda-web.us-east-1.on.aws
  api: https://app.example.com/api
```

Each web app is listed with its own endpoint and with the URL it serves on the domain. Behind a domain, a web app's own endpoint accepts only requests signed with AWS credentials, so visitors use the domain.

## Call the app

Open `https://app.example.com` in a browser. The page shows the JSON that the Express API returned for `/api/hello`. The API answers on the domain directly too:

```bash
curl https://app.example.com/api/hello
```

```json
{ "message": "Hello from the Express API!", "host": "app.example.com", "time": "2026-10-15T08:37:58.388Z" }
```

`serverless invoke --web-app` sends a signed request to a web app's own endpoint, which is useful to check one app on its own:

```bash
serverless invoke --web-app api --path /api/health --param="domain=app.example.com"
```

```text
HTTP 200 OK
content-length: 15
content-type: application/json; charset=utf-8
date: Thu, 15 Oct 2026 08:38:24 GMT
etag: W/"f-VaSQ4oDUiZblZNAEkkN+sX+q3Sg"
lambda-web-logstream: 2026/10/15/aws-node-web-app-custom-domain-dev-api[rev-uoxcd]ab49ce60340f4d1cb89aaf867ef1aae3
lambda-web-request-id: CXAZXZ7YT4FOEU7XQO7QAV3VIE
x-powered-by: Express

{"status":"ok"}
```

`serverless logs --web-app api` and `serverless logs --web-app web` print each app's logs. Pass the same `--param` to every command, as the configuration reads the hostname from it, unless the stage sets `domain` under `stages`.

## Remove

```bash
serverless remove --param="domain=app.example.com"
```

This deletes the stack and the uploaded code. The stack holds both web functions with their endpoints and log groups, the CloudFront distribution, and the A and AAAA records. Removing the distribution takes a few minutes.

A certificate the deploy requested stays, with its DNS validation record, so a later deploy with the same hostname reuses it. To delete them, delete the certificate in ACM in us-east-1, and its `_<hash>.app.example.com` CNAME validation record in the hosted zone. A certificate that existed before, such as a wildcard certificate, is left as it was.
