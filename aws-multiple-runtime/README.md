<!--
title: 'AWS Multiple Runtime example'
description: 'This example demonstrates how you can run multiple runtimes in AWS Lambda.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/christophgysin'
authorName: 'Christoph Gysin'
authorAvatar: 'https://avatars0.githubusercontent.com/u/527924?v=4&s=140'
-->
# Multiple Runtimes Example

This example demonstrates how you can run multiple runtimes (Node.js and Python) side by side in the same Serverless Framework service. The `time` function runs on `nodejs24.x` and returns the current Unix timestamp; the `hello` function runs on `python3.14`, calls the `time` endpoint over HTTP, and renders a greeting with the formatted date.

## Deploy

In order to deploy the example, simply run:

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Deploying hellotime-app to stage dev (us-east-1)

✔ Service deployed to stack hellotime-app-dev (32s)

endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/greet
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/time
functions:
  hello: hellotime-app-dev-hello (1.5 kB)
  time: hellotime-app-dev-time (1.1 kB)
```

## Usage

Fetch the greeting from the `/greet` endpoint (served by the Python function, which internally calls the Node.js `/time` endpoint):

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/greet
```

You should see a response similar to:

```html
<html><body><p>Hello! It is now July 15, 2026.</p></body></html>
```

You can also call the `/time` endpoint directly:

```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/time
```
