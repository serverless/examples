<!--
title: OpenWhisk Simple HTTP Endpoint example in Python
description: This example demonstrates how to setup a simple HTTP GET endpoint.
layout: Doc
-->
# Serverless Boilerplate - OpenWhisk - Python

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).

## 1. Install Provider Plugin
`npm install -g serverless-openwhisk` 

## 2. Install Service Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 3. Deploy
`serverless deploy` or `sls deploy`. `sls` is shorthand for the Serverless CLI command

Make a note of the API endpoint that is logged to the console during deployment.

```
endpoints:
GET https://xxx.api-gw.mybluemix.net/python-service/ping --> python-service-dev-currentTime
```

## 4. Invoke deployed function
`serverless invoke --function currentTime` or `serverless invoke -f currentTime`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
{
    "message": "Hello stranger, the current time is 15:59:30.983379"
}
```

## 5. Test HTTP endpoint

Use a HTTP client to access the endpoint for your function. The endpoint will
be the API gateway root path, logged during deployment, and your configured
function path.

```
$ http get https://xxx.api-gw.mybluemix.net/python-service/ping
HTTP/1.1 200 OK
...
{
    "message": "Hello stranger, the current time is 16:00:11.837331"
}

$ http get https://xxx.api-gw.mybluemix.net/python-service/ping?name=James
HTTP/1.1 200 OK
...
{
    "message": "Hello James, the current time is 16:00:15.749699"
}
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/aws/guide/credentials/](https://serverless.com/framework/docs/providers/aws/guide/credentials/).**
