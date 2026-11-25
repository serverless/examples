<!--
title: 'Simple LINE bot'
description: 'This is a simple echo bot on LINE bot.'
framework: v4
platform: AWS
language: Python
priority: 10
authorLink: 'https://github.com/NiJia'
authorName: 'NiJia'
authorAvatar: 'https://avatars0.githubusercontent.com/u/418548?v=4&s=140'
-->

# AWS-python-line-echo-bot

This is a simple echo bot on LINE bot. (python), built with [line-bot-sdk](https://github.com/line/line-bot-sdk-python) v3.

## Before you start

1. LINE developer account
2. [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/getting-started/)

## Get Started

1.  Install serverless via npm

```bash
$ npm install -g serverless
```

2. Setup your AWS credentials

```bash
$ export AWS_ACCESS_KEY_ID=<your-key-here>
$ export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

3. Setup your LINE bot secret & access token as environment variables (used by `serverless.yml` to populate the Lambda environment):

```bash
$ export CHANNEL_ACCESS_TOKEN=<your-channel-access-token>
$ export CHANNEL_SECRET=<your-channel-secret>
```

4. Deploy the webhook function

```bash
$ npm install
$ serverless deploy
```

The webhook validates the `X-Line-Signature` header on every request (via `WebhookParser`) and replies to text messages using the Messaging API v3 client.

## Notes on packaging

`line-bot-sdk` v3 pulls in `pydantic` / `pydantic-core`, a native (Rust) extension. The function
runs on `python3.15` and `arm64`, so `custom.pythonRequirements.pipCmdExtraArgs` makes pip download
Linux arm64 wheels built for Python 3.15 (`--platform=manylinux2014_aarch64`,
`--platform=manylinux_2_28_aarch64`, `--python-version=3.15`, `--only-binary=:all:`) on any machine.
Without them, packaging on another platform would bundle the host's native wheel, which can't load in
Lambda; with them, packaging stops with an error if a compatible wheel isn't available.

![Echo bot](https://i.imgur.com/Tn1XS13.png)
