<!--
title: 'OpenWhisk Serverless Chaining Functions example in NodeJS'
description: 'This example demonstrates chaining functions in NodeJS.'
layout: Doc
framework: v1
platform: OpenWhisk
language: nodeJS
authorLink: 'https://github.com/jthomas'
authorName: 'James Thomas'
authorAvatar: 'https://avatars2.githubusercontent.com/u/2322?v=4&s=140'
-->
# Serverless Boilerplate - OpenWhisk - Node.js

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).

## 1. Install Provider Plugin & Service Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 2. Deploy
`serverless deploy` or `sls deploy`. `sls` is shorthand for the Serverless CLI command

## 3. Invoke sequence function
`serverless invoke --function chained_seq --data '{"message": "a b c d e"}'` 

`-f` is also shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
{
    "message": "e d c b a"
}
```

## 4. Invoke chained function
`serverless invoke --function manual_seq --data '{"message": "a b c d e"}'` 

`-f` is also shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
{
    "message": "e d c b a"
}
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
