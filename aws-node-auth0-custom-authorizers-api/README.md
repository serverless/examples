<!--
title: 'AWS API Gateway Custom Authorizer Function with Auth0 example in NodeJS'
description: 'This is an example of how to protect API endpoints with Auth0, JSON Web Tokens (jwt) and a custom authorizer lambda function.'
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/erezrokah'
authorName: 'Erez Rokah'
authorAvatar: 'https://avatars0.githubusercontent.com/u/26760571?v=4&s=140'
-->
# API Gateway Custom Authorizer Function + Auth0

This is an example of how to protect API endpoints with [auth0](https://auth0.com/), JSON Web Tokens (jwt) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).

Custom Authorizers allow you to run an AWS Lambda Function before your targeted AWS Lambda Function. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.

### [View live demo](http://auth0-serverless-protected-routes-demo.surge.sh/)

## Use cases

- Protect API routes for authorized users
- Rate limiting APIs

## Setup

1. `npm install` json web token dependencies

2. Setup an [auth0 application](https://auth0.com/docs/applications).

3. Get your `Client ID` (under `applications->${YOUR_APP_NAME}->settings`) and plugin your `AUTH0_CLIENT_ID` in a new file called `secrets.json` (based on `secrets.example.json`).

4. Get your `public key` (under `applications->${YOUR_APP_NAME}->settings->Show Advanced Settings->Certificates->DOWNLOAD CERTIFICATE`). Download it as `PEM` format and save it as a new file called `public_key`

5. Deploy the service with `serverless deploy` and grab the public and private endpoints.

6. Plugin your `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, and the `PUBLIC_ENDPOINT` + `PRIVATE_ENDPOINT` from aws in top of the `frontend/app.js` file.

  ```js
  /* frontend/app.js */
  // replace these values in app.js
  const AUTH0_CLIENT_ID = 'your-auth0-client-id-here';
  const AUTH0_DOMAIN = 'your-auth0-domain-here.auth0.com';
  const PUBLIC_ENDPOINT = 'https://your-aws-endpoint-here.amazonaws.com/dev/api/public';
  const PRIVATE_ENDPOINT = 'https://your-aws-endpoint-here.us-east-1.amazonaws.com/dev/api/private';
  ```

7. Deploy Frontend to host of your choosing and make sure to configure the `Allowed Callback URL` and `Allowed Origins` in your auth0 client in the [auth0 dashboard](https://manage.auth0.com). We used `http://auth0-serverless-protected-routes-demo.surge.sh/` for our demo.

## Custom authorizer functions

[Custom authorizers functions](https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/) are executed before a Lambda function is executed and return an Error or a Policy document.

The Custom authorizer function is passed an `event` object as below:

```javascript
{
  "type": "TOKEN",
  "authorizationToken": "<Incoming bearer token>",
  "methodArn": "arn:aws:execute-api:<Region id>:<Account id>:<API id>/<Stage>/<Method>/<Resource path>"
}
```

## Frontend

The frontend is a bare bones vanilla javascript implementation.

You can replace it with whatever frontend framework you like =)

If you do implement in another framework, please consider adding it our [growing list of examples](https://github.com/serverless/examples/)!

API calls are made with the browser's native `fetch` api.
