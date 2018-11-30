<!--
title: 'GCF Simple HTTP Endpoint example in golang'
description: This example demonstrates how to setup a simple golang HTTP GET endpoint on GCP Cloud Functions. When you ping the endpoint we've set up you'll see the time returned for the given request type.
layout: Doc
framework: v1
platform: 'Google Cloud'
language: golang
authorLink: 'https://github.com/sebito91'
authorName: 'Sebastian Borza'
authorAvatar: 'https://avatars0.githubusercontent.com/u/3159454?v=4&s=140'
-->

# Simple HTTP Endpoint Example

This example demonstrates how to setup a simple golang HTTP GET endpoint. When you fetch the endpoint we've set up here you'll see
the time returned for the given request type.

## Use Cases

- Wrapping an existing internal or external endpoint/service

## Development

The GCF golang runtime has a few requirements when defining your solution, namely:

- Your function must be exported (e.g `Hello`)
- You must define a non-main package, which can have an arbitrary name: `package p`
- Your function code may not contain `package main` or a `func main()`

Since this is an alpha runtime provided by GCF the docs are not yet available for consumption. We'll update this README
once those instructions are made public.

## Deploy

In order to deploy the you endpoint simply run

```bash
serverless deploy -v
```

The expected result should be similar to:

```bash
Serverless: Uploading artifacts...
Serverless: Artifacts successfully uploaded...
Serverless: Updating deployment...
Serverless: Checking deployment update progress...
..............
Serverless: Done...
Service Information
service: golang-simple-http-endpoint
project: <project_name>
stage: dev
region: <region>

Deployed functions
currentTime
  https://<region>-<project_name>.cloudfunctions.net/endpoint
```

## Usage

You can now invoke the Cloud Function directly and even see the resulting log via

```bash
serverless invoke --function hello 
```

The expected result should be similar to:

```bash
Serverless: 6xthowrso4u2 {"message":"Go Serverless v1! Your function executed hello successfully!"}
```

And to check out the logs directly from sls, you can run the following:

```bash
serverless logs --function hello 
...
Serverless: Displaying the 10 most recent log(s):

2018-11-21T17:44:58.450200631Z: Function execution took 7 ms, finished with status code: 200
2018-11-21T17:44:58.443618562Z: Function execution started
2018-11-21T17:43:40.651063187Z: Function execution took 8 ms, finished with status code: 200
2018-11-21T17:43:40.644123421Z: Function execution started
2018-11-21T17:43:35.688702419Z: Function execution took 25 ms, finished with status code: 200
2018-11-21T17:43:35.664212161Z: Function execution started
2018-11-21T17:40:46.166468516Z: Function execution took 6 ms, finished with status code: 200
2018-11-21T17:40:46.161422666Z: Function execution started
2018-11-21T17:33:27.004019351Z: Function execution took 10 ms, finished with status code: 200
2018-11-21T17:33:26.994600775Z: Function execution started
```

Finally you can send an HTTP request directly to the endpoint using a tool like curl:

```bash
curl https://<region>-<project_name>.cloudfunctions.net/Hello
```

**NOTE:** notice that the request terminates with your golang exported function name, not the serverless function
name you've defined.
