<!--
title: 'OpenWhisk Simple HTTP Endpoint example in NodeJS'
description: 'This example demonstrates how to setup a simple HTTP GET endpoint.'
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

Make a note of the API endpoint that is logged to the console during deployment.

```
Serverless: Configured API endpoint: https://xxx-yyy-zzz-gws.api-gw.mybluemix.net/my_service
```

## 3. Invoke deployed function
`serverless invoke --function time` or `serverless invoke -f time`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
{
    "payload": "The time in Europe/London is: 16:01:14."
}
```

## 4. Test HTTP endpoint

Use a HTTP client to access the endpoint for your function. The endpoint will
be the API gateway root path, logged during deployment, and your configured
function path.

```
$ http get https://xxx-yyy-zzz-gws.api-gw.mybluemix.net/my_service/time
{
    "payload": "The time in Europe/London is: 16:01:07."
}
$ http get https://xxx-yyy-zzz-gws.api-gw.mybluemix.net/my_service/time?timezone=Europe/Berlin
{
    "payload": "The time in Europe/Berlin is: 17:01:11."
}
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
