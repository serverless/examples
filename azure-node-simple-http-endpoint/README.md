<!--
title: Azure Simple HTTP Endpoint example in NodeJS
description: In this example, we deploy an HTTP Node.js Azure Function. This example shows you how to read properties off of a query string or the request body, then set a result back to Azure.
layout: Doc
-->
# Simple HTTP example

In this example, we deploy an HTTP Node.js Azure Function. This sample show you how to read properties off of a query string or the request body, then set a result back to Azure.

See the [Azure Functions Serverless Plugin docs](https://www.serverless.com/framework/docs/providers/azure/) for more info.

## Setup

1. We recommend Node.js v6.5.0
2. Install the serverless framework - `npm i -g serverless`
3. Install the dependencies of this example - `npm i`

## Deploying

To deploy, set up your [Credentials](https://www.serverless.com/framework/docs/providers/azure/guide/credentials) and run

```bash
serverless deploy
```

## Invoking

Once deployed, run

```bash
serverless invoke -f hello
```
