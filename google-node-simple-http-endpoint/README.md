<!--
title: 'GCF Simple HTTP Endpoint example in NodeJS'
description: 'This example demonstrates how to setup a simple HTTP GET endpoint.'
layout: Doc
framework: v1
platform: 'Google Cloud'
language: nodeJS
authorLink: 'https://github.com/pmuens'
authorName: 'Philipp Muens'
authorAvatar: 'https://avatars3.githubusercontent.com/u/1606004?v=4&s=140'
-->
# Pre-request 
Follow below link to setup google account for deploying your first serveless application.
[Google account setup](https://www.serverless.com/framework/docs/providers/google/guide/credentials/)

# Simple HTTP example

# Setup

1. Install Serverless with `npm install -g serverless`
2. Install the dependencies `npm install`

# Setting the credentials and project

Update the `credentials` and your `project` property in the `serverless.yml` file.

# Deployment

```
serverless deploy
```

You should see your functions URL endpoint after the deployment

# Invoking

```
curl <the-endpoint-url>
```

# Caveats

# Below are the errors will occure during serveless deploy
1. Enable Cloud Deployment Manager V2 API - make sure Cloud Deployment V2 API is enabled other wise you will get below error during serverless deployment 
```
Error: Cloud Deployment Manager V2 API has not been used in project <projectid> before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/deploymentmanager.googleapis.com/overview?project=<projectid> then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.
```
2. Enable Cloud Functions API - make sure Cloud Function API is enabled. Other wise you will get below error.
``` 
{"ResourceType":"cloudfunctions.v1beta2.function","ResourceErrorCode":"403","ResourceErrorMessage":{"code":403,"message":"Cloud Functions API has not been used in project <projectId> before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/cloudfunctions.googleapis.com/overview?project=<projectId> then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.","status":"PERMISSION_DENIED"
```
3. sls deploy --region us-central1 - provide region during sls or serverless deployment , other wise below rest endpoints will be created for your handler , example outof servlerless deployment console.
```
Service Information
service: node-simple-http-endpoint
project: <project name>
stage: dev
region: undefined
Deployed functions
helloWorld
  https://undefined-<projectname>.cloudfunctions.net/http
```

