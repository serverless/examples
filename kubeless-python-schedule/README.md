<!--
title: Kubeless Serverless Simple scheduled example in Python
description: This example demonstrates a simple example in Python for a scheduled function.
layout: Doc
-->
# Serverless Boilerplate - Kubeless - Python

Make sure `kubeless` and `serverless` are installed. See the respective installation guides:
* [Kubeless](https://github.com/kubeless/kubeless/blob/master/README.md#usage)
* [Serverless](https://github.com/serverless/serverless#quick-start)

Please see the [this guide for more information](https://github.com/serverless/serverless-kubeless/blob/master/README.md).

## 1. Install Service Dependencies
Run `npm install` in this directory to download the modules from `package.json`.

## 2. Setting the schedule
You can check that we are setting the function schedule in the `serverless.yml` file. This schedule should follow the Cron notation. In this example we are setting it to `* * * * *` for the function to be executed every minute.

## 3. Deploy
Run `serverless deploy` in order to deploy the function defined in `serverless.yml`

```bash
$ serverless deploy
Serverless: Packaging service...
Serverless: Deploying function clock...
Serverless: Function clock successfully deployed
```

## 3. Check the function logs
Run `serverless logs --function clock`

In your terminal window you should see the consecutive executions of the scheduled function:

```bash
$ sls logs -f clock
Bottle v0.12.13 server starting up (using CherryPyServer())...
Listening on http://0.0.0.0:8080/
Hit Ctrl-C to quit.
172.17.0.1 - - [26/Sep/2017:10:25:27 +0000] "GET /healthz HTTP/1.1" 200 2 "" "Go-http-client/1.1" 0/153
172.17.0.1 - - [26/Sep/2017:10:25:41 +0000] "GET /healthz HTTP/1.1" 200 2 "" "Go-http-client/1.1" 0/96
10:26
172.17.0.10 - - [26/Sep/2017:10:26:04 +0000] "GET / HTTP/1.1" 200 5 "" "Wget" 0/1647
172.17.0.1 - - [26/Sep/2017:10:26:11 +0000] "GET /healthz HTTP/1.1" 200 2 "" "Go-http-client/1.1" 0/95
172.17.0.1 - - [26/Sep/2017:10:26:41 +0000] "GET /healthz HTTP/1.1" 200 2 "" "Go-http-client/1.1" 0/100
10:27
```

**For more information on the Serverless Kubeless plugin, please see the project repository: [https://github.com/serverless/serverless-kubeless](https://github.com/serverless/serverless-kubeless).**
