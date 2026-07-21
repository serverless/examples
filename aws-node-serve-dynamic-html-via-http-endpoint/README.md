<!--
title: 'AWS Serving Dynamic HTML via API Gateway example in NodeJS'
description: 'This example illustrates how to hookup an API Gateway endpoint to a Lambda function to render HTML on a GET request.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/slate71'
authorName: 'Lukas Andersen'
authorAvatar: 'https://avatars0.githubusercontent.com/u/2078561?v=4&s=140'
-->
# Serving Dynamic HTML via API Gateway Example

This example illustrates how to hookup an API Gateway endpoint to a Lambda function to render HTML on a `GET` request.

## Use-cases

- Landing pages for marketing activities
- Single use dynamic webpages

## How it works

Instead of returning the default `json` from a request, you can display custom dynamic HTML by setting the `Content-Type` header to `text/html`.

```js
return {
  statusCode: 200,
  headers: {
    'Content-Type': 'text/html',
  },
  body: html,
};
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```
Deploying "dynamic-html-endpoint" to stage "dev" (us-east-1)

✔ Service deployed to stack dynamic-html-endpoint-dev (91s)

endpoint: GET - https://nzkl1kas89.execute-api.us-east-1.amazonaws.com/dev/landing-page
functions:
  landingPage: dynamic-html-endpoint-dev-landingPage (1.1 kB)
```

## Usage

You can now send an HTTP request directly to the endpoint using a tool like curl

```bash
curl https://nzkl1kas89.execute-api.us-east-1.amazonaws.com/dev/landing-page?name=Nik%20Graf
```

The expected result should be similar to:

```bash
<html>
  <style>
    h1 { color: #73757d; }
  </style>
  <body>
    <h1>Landing Page</h1>
    <p>Hey Nik Graf!</p>
  </body>
</html>
```

Of course you can visit the URL in your browser and this is how it should look like:

![Screenshot without a name](https://cloud.githubusercontent.com/assets/223045/20668061/12c6db9a-b56d-11e6-911c-8396d545471a.png)

To greet a specific person, provide the query parameter with the name of that person e.g. `?name=Nik%20Graf`. The response should now contain the provided name:

![Screenshot with a name](https://cloud.githubusercontent.com/assets/223045/20668055/0758b4cc-b56d-11e6-80ce-3e137151311f.png)

## Scaling

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 1000. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).
