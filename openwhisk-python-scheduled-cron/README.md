<!--
title: 'OpenWhisk Serverless Scheduled Cron job example in Python'
description: 'This example demonstrates scheduleding a cron job.'
layout: Doc
framework: v1
platform: OpenWhisk
language: Python
authorLink: 'https://github.com/jthomas'
authorName: 'James Thomas'
authorAvatar: 'https://avatars2.githubusercontent.com/u/2322?v=4&s=140'
-->
# Serverless Boilerplate - OpenWhisk - Python

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).

## 1. Install Project Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 2. Deploy
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
service:	python_service

actions:
python_service-dev-cron

triggers:
python_service_cron_schedule_trigger

rules:
python_service_cron_schedule_rule
```

## 3. Monitor function logs

After sixty seconds the function should be executed and you can review the
logging output using `serverless logs --function cron` or `serverless logs -f cron`

```bash

$ serverless logs -f cron
activation (78ebd109b3bd4da5bb20c13bd2982319):
2028 16:51:01.539 Your cron function /james.thomas@uk.ibm.com_dev/python_service-dev-cron ran at 15:51:01.538616
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
