<!--
title: Azure Simple HTTP Endpoint example in NodeJS
description: In this example, we deploy an HTTP Node.js Azure Function. This example shows you how to read properties off of a query string or the request body, then set a result back to Azure.
layout: Doc
-->
# Simple HTTP example

In this example, we deploy an HTTP Node.js Azure Function. This sample show you
how to read properties off of a query string or the request body, then set a
result back to Azure.

See the [Azure Functions Serverless Plugin docs](https://www.serverless.com/framework/docs/providers/azure/) for more info.

_Note: you may need to change the `service` name in `serverless.yml`_

## Setup

1. We recommend Node.js v6.5.0
2. Install the serverless framework - `npm install -g serverless`
3. Install the dependencies of this example - `npm install`

## Deploying

To deploy, use the `deploy` and follow the instructions to log into your Azure
account.

```bash
$ serverless deploy
Serverless: Packaging service...
Serverless: Logging in to Azure
Serverless: Paste this code (copied to your clipboard) into the launched browser, and complete the authentication process: BLAZSRMVJ
```

Once authenticated, the session will continue and deploy the app.

## Invoking

Invoke the deployed function using the `invoke` command.

```bash
$ serverless invoke -f hello -d "{ \"name\": \"World\" }"
Serverless: Logging in to Azure
"Hello World"
```
