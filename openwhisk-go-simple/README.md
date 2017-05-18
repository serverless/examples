<!--
title: OpenWhisk Serverless Boilerplate example in Go
description: This example shows a Serverless boilerplate in Go.
layout: Doc
-->
# Serverless Boilerplate - OpenWhisk - Go

Make sure `serverless` is installed. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your OpenWhisk account credentials using environment variables or a configuration file. Please see the [this guide for more information](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).

## 1. Install Provider Plugin
`npm install -g serverless-openwhisk` 

## 2. Install Service Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 3. Compile Go Binary

```
$ env GOOS=linux GOARCH=amd64 go build handler.go
```

## 4. Deploy
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
service:	go-service

actions:
go-service-dev-greeting
```

## 5. Invoke deployed function
`serverless invoke --function greeting` or `serverless invoke -f greeting`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
$ serverless invoke -f greeting
{
    "msg": "Hello stranger!"
}
$ serverless invoke -f greeting -d '{"name": "James"}'
{
    "msg": "Hello James!"
}
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
