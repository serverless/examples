<!--
title: 'Serverless Framework Sandboxes: Minimal AWS Lambda MicroVM Example'
description: Smallest possible sandboxes configuration, using only the required artifact field and framework defaults.
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Minimal sandbox example

The smallest possible `sandboxes` configuration: a single sandbox with only the
required `artifact` field. Every other setting falls back to a framework default.

```yml
sandboxes:
  app:
    artifact: ./app
```

## What the defaults resolve to

| Setting         | Default                                                  |
| --------------- | -------------------------------------------------------- |
| `minimumMemory` | 2048 MiB                                                 |
| architecture    | ARM64                                                    |
| base image      | latest managed `al2023` base                             |
| egress          | `INTERNET_EGRESS` (outbound internet, no VPC)            |
| hooks           | off — the app only needs to serve its HTTP port          |
| IAM             | auto-generated build + execution roles (least-privilege) |
| logs            | CloudWatch group `/aws/lambda-microvms/<image-name>`     |

The app (`app/app.js`) is a tiny Node.js HTTP echo server on port **8080**. No
lifecycle-hook server is needed because hooks are off by default.

## Deploy

```bash
serverless deploy
```

```text
✔ Service deployed to stack sandboxes-minimal-dev (…s)

dashboard: https://<region>.console.aws.amazon.com/cloudwatch/home?region=<region>#dashboards/dashboard/sandboxes-minimal-dev-sandboxes
```

Observability is on by default, so `serverless deploy` prints a CloudWatch **dashboard** URL even for this minimal config.

## Invoke

```bash
serverless invoke --sandbox app --path /hello
# --sandbox names which sandbox to call and is required (even with one sandbox).
# --method and --path are optional (default GET /).
```

The app echoes the request:

```json
{"method":"GET","path":"/hello","body":""}
```

## Logs

Defaults to the last 10 minutes of events; widen the window with `--startTime`:

```bash
serverless logs --sandbox app --startTime 30m
```

## Develop locally

```bash
serverless dev --sandbox app   # edits to app/ rebuild the image automatically
```

It starts a local, SDK-compatible AWS Lambda MicroVMs emulator (prints its endpoint, e.g. `http://127.0.0.1:9100`); point the AWS SDK/CLI at that endpoint (`--endpoint-url`) to launch the sandbox locally with no cloud cost.

## Remove

```bash
serverless remove
```

> See `../complete/` for a fuller example with a VPC, lifecycle hooks, environment
> variables, tags, and an `s3://` pre-built artifact.
