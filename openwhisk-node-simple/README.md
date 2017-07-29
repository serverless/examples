<!--
title: OpenWhisk Serverless Simple example in NodeJS
description: This example demonstrates a simple example in NodeJS.
layout: Doc
-->
# Serverless Boilerplate - OpenWhisk - Node.js

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

## 1. Install Provider Plugin
`npm install -g serverless-openwhisk` 

## 2. Install Service Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 3. Deploy
`serverless deploy` or `sls deploy`. `sls` is shorthand for the Serverless CLI command

## 4. Invoke deployed function
`serverless invoke --function hello_world` or `serverless invoke -f hello_world`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
{
    "payload": "Hello, World!"
}
```

Congrats you have just deployed and run your Hello World function!

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/aws/guide/credentials/](https://serverless.com/framework/docs/providers/aws/guide/credentials/).**

