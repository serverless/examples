<!--
title: OpenWhisk Serverless Boilerplate using Docker example in NodeJS
description: This example shows a Serverless boilerplate using Docker in NodeJS.
layout: Doc
-->
# Serverless Boilerplate - OpenWhisk - Node.js & Docker

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
Serverless: Deploying Sequences...
Serverless: Deployment successful!

Service Information
platform:	openwhisk.ng.bluemix.net
namespace:	_
service:	testing

actions:
testing-dev-location_sunrise_sunset    testing-dev-sunrise_sunset    testing-dev-location_from_address    testing-dev-jq
```

## 4. Invoke sequence function
`serverless invoke -f location_sunrise_sunset -d '{"address": "london"}'`

`-f` is also shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```bash
{
    "results": {
        "astronomical_twilight_end": "8:26:54 PM",
        "day_length": "12:48:55",
        "civil_twilight_begin": "5:06:55 AM",
        "solar_noon": "12:05:03 PM",
        "sunrise": "5:40:36 AM",
        "civil_twilight_end": "7:03:11 PM",
        "sunset": "6:29:31 PM",
        "nautical_twilight_end": "7:43:44 PM",
        "astronomical_twilight_begin": "3:43:12 AM",
        "nautical_twilight_begin": "4:26:22 AM"
    },
    "status": "OK"
}
```

**For more information on the Serverless OpenWhisk plugin, please see the project repository: [https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/](https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/).**
