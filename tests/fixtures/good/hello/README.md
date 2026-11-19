<!--
title: 'Hello function'
description: 'A minimal example used by the checker tests.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Hello function

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/hello.svg)](https://github.com/serverless/examples/blob/verified/results.json)

A single Lambda function that returns a greeting.

## What it deploys

One Lambda function.

## Prerequisites

Node.js 24 and the Serverless Framework.

## Deploy

```bash
npm ci
serverless deploy
```

## Try it

```bash
serverless invoke --function hello
```

## How it works

The handler returns a fixed message.

## Cost and cleanup

The function costs nothing while idle. Remove it with:

```bash
serverless remove
```

## Next steps

Add an HTTP event.
