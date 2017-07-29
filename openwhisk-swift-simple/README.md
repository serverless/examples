<!--
title: OpenWhisk Serverless Simple example in Swift
description: This example demonstrates a simple example in Swift.
layout: Doc
-->
# Serverless Boilerplate - OpenWhisk - Swift

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).

## 1. Install Provider Plugin
`npm install -g serverless-openwhisk` 

## 2. Install Service Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 3. Deploy
`serverless deploy` or `sls deploy`. `sls` is shorthand for the Serverless CLI command

```
Serverless: Packaging service...
Serverless: Compiling Functions...
Serverless: Compiling API Gateway definitions...
Serverless: Compiling Rules...
Serverless: Compiling Triggers & Feeds...
Serverless: Deploying Functions...
Serverless: Deployment successful!

Service Information
platform:	openwhisk.ng.bluemix.net
namespace:	_
service:	swift-service

actions:
swift-service-dev-ping
```

## 4. Invoke deployed function
`serverless invoke --function ping` or `serverless invoke -f ping`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
$ serverless invoke -f ping
{
}
$ serverless invoke -f ping -d '{"name": "James"}'
{
    "greeting": "Hello James! The time is 2017-03-28 16:24:23"
}
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
