<!--
title: OpenWhisk Serverless Scheduled Cron job example in Swift
description: This example demonstrates scheduleding a cron job.
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
$ serverless deploy
Serverless: Packaging service...
Serverless: Compiling Functions...
Serverless: Compiling API Gateway definitions...
Serverless: Compiling Rules...
Serverless: Compiling Triggers & Feeds...
Serverless: Deploying Functions...
Serverless: Deploying Triggers...
Serverless: Binding Feeds To Triggers...
Serverless: Deploying Rules...
Serverless: Deployment successful!

Service Information
platform:	openwhisk.ng.bluemix.net
namespace:	_
service:	swift_service

actions:
swift_service-dev-cron

triggers:
swift_service_cron_schedule_trigger

rules:
swift_service_cron_schedule_rule
```

## 4. Monitor function logs

After sixty seconds the function should be executed and you can review the
logging output using `serverless logs --function cron` or `serverless logs -f cron`

```bash

$ serverless logs -f cron
activation (96d31322bab24cf1940e7b05b428ee34):
2017-03-28 17:47:05.084 Compiling
2017-03-28 17:47:06.943 swiftc status is 0
2017-03-28 17:47:06.943 Linking
2017-03-28 17:47:07.073 Swift function (/james.thomas@uk.ibm.com_dev/swift_service-dev-cron) was called @ 2017-03-28 16:47:07
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
