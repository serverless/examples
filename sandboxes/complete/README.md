<!--
title: 'Serverless Framework Sandboxes: Complete AWS Lambda MicroVM Example'
description: 'Deploy-as-is showcase of every sandboxes property: Dockerfile build, memory, hooks, observability, IAM, and tags.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework — AWS Lambda MicroVMs (`sandboxes`) — complete example

A complete, **deploy-as-is** showcase of the `sandboxes` top-level property, which
deploys [AWS Lambda MicroVMs](https://www.serverless.com/framework/docs/providers/aws/guide/sandboxes).
`serverless deploy` works with no edits — read `serverless.yml` top to bottom and
you've seen most of what the feature does.

The single `api` sandbox exercises: a local Dockerfile build, `minimumMemory`,
`description`, `environment`, lifecycle `hooks` (`ready` + `run`), full
`observability` (custom metric `filters`, `alarms` → a self-contained SNS topic,
and a `dashboard`), custom `iam`, and `tags`. VPC egress and a pre-built `s3://`
artifact are included as commented blocks (they need account-specific IDs).

The app (`app/app.js`) is a tiny Node.js echo server on **:8080** plus a
lifecycle-hook server on **:9000**.

## What gets created

`serverless deploy` provisions, for the `api` sandbox:

- `AWS::Lambda::MicrovmImage` — the sandbox image (built in-cloud from `./app`)
- build + execution **IAM roles** (least-privilege, plus your custom `iam` statements)
- a CloudWatch **log group** (`/aws/lambda-microvms/sandboxes-example-api-<stage>`)
- a **metric filter + alarm** for each `observability.metrics.filters` entry (`errors`, `warnings`)
- an **SNS topic** (`AlertTopic`) the alarms publish to
- **one dashboard per service** — `sandboxes-example-<stage>-sandboxes`

## Deploy

```bash
serverless deploy
```

```text
✔ Service deployed to stack sandboxes-example-dev (…s)

dashboard: https://<region>.console.aws.amazon.com/cloudwatch/home?region=<region>#dashboards/dashboard/sandboxes-example-dev-sandboxes
```

`serverless deploy` prints the CloudWatch **dashboard** URL for the service — open it to see the metrics, logs, and alarm widgets.

After deploy, subscribe to the alerts topic to actually receive alarm notifications:

```bash
aws sns subscribe --protocol email --notification-endpoint you@example.com \
  --topic-arn "$(aws sns list-topics --query "Topics[?contains(TopicArn,'AlertTopic')].TopicArn | [0]" --output text)"
```

## Invoke

```bash
serverless invoke --sandbox api --path /hello
# --sandbox is required (it names which sandbox to call) and is the invoke target.
# --method and --path are optional (default GET /).
```

The app echoes the request; `GREETING` is the `environment` variable from `serverless.yml`:

```json
{"method":"GET","path":"/hello","headers":{"host":"<microvm-id>.lambda-microvm.us-east-1.on.aws"},"body":"","GREETING":"hello-from-sandboxes"}
```

## See the alarm and dashboard react

`observability` is on by default. To watch it work, send a few requests whose log lines match the `errors` filter, then open the dashboard URL from the deploy output:

```bash
for i in 1 2 3 4 5 6; do serverless invoke --sandbox api --path "/error-$i" >/dev/null; done
```

Within ~2 minutes the dashboard's **errors** metric climbs to 6 and the **errors alarm flips to `ALARM`** (threshold 5); a few `/warn-*` requests move the warnings metric without tripping its alarm (3 ≤ 5).

## Logs

Defaults to the last 10 minutes of events; widen the window with `--startTime`:

```bash
serverless logs --sandbox api --startTime 30m
```

## Develop locally

Run the sandbox on your machine (Docker), with the same config — edits to `app/`
rebuild the image automatically:

```bash
serverless dev --sandbox api
```

It starts a local, SDK-compatible AWS Lambda MicroVMs emulator (prints its endpoint, e.g. `http://127.0.0.1:9100`); point the AWS SDK/CLI at that endpoint (`--endpoint-url`) to launch the sandbox locally with no cloud cost.

## Roll back

Each deploy is retained; roll back to a previous one:

```bash
serverless deploy list            # list timestamps
serverless rollback --timestamp <timestamp>
```

## Remove

```bash
serverless remove
```

## Enabling the commented examples

- **VPC egress** (`worker`): uncomment the block and set `vpc.subnetIds` /
  `vpc.securityGroupIds` to IDs from your account. Subnets must be in
  MicroVM-supported Availability Zones (in `us-east-1`, avoid `use1-az3`).
- **Pre-packaged S3 artifact** (`prebuilt`): zip and upload the app source, then
  set the `s3://` URI (the framework still builds the image in-cloud from it):
  ```bash
  cd app && zip -r /tmp/worker-src.zip . && aws s3 cp /tmp/worker-src.zip s3://<your-bucket>/worker-src.zip
  ```

> See `../minimal/` for the smallest possible configuration (just `artifact`).
