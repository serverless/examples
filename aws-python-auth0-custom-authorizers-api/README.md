<!--
title: 'AWS API Gateway Custom Authorizer Function with Auth0 example in Python'
description: 'This is an example of how to protect API endpoints with Auth0, JSON Web Tokens (jwt) and a custom authorizer lambda function in Python 3.'
layout: Doc
framework: v1
platform: AWS
language: Python
authorLink: 'https://github.com/BrianAndersen78'
authorName: BrianAndersen78
authorAvatar: 'https://avatars3.githubusercontent.com/u/30560831?v=4&s=140'
-->
# API Gateway Custom Authorizer Function + Auth0

This is an example of how to protect API endpoints with [auth0](https://auth0.com/), JSON Web Tokens (jwt) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).

Custom Authorizers allow you to run an AWS Lambda Function before your targeted AWS Lambda Function. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.

## Use cases

- Protect API routes for authorized users
- Rate limiting APIs

## Setup

1. You must have Python 3! Once you do, run `pip install -r requirements.txt` to install Python web token dependencies

2. Install Docker. Why Docker? Because it's the only way to ensure that the Python package that is
   created on your local machine and uploaded to AWS will actually run in AWS's lambda containers. 

2. Setup an [auth0 client](https://auth0.com/docs/clients) and get your `client id` and `client secrets` from auth0.

3. Plugin your `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` in a new file called `secrets.json`. These will be used by the JSON web token decoder to validate private api access.

4. Copy the `public_key-example` file to a new file named `public_key` and follow the instructions in that file

5. Deploy the Lambda Authorizer to AWS with `make deploy` and grab the public and private endpoints from the `endpoints:` section of the `make` command output

6. Plugin your `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, and the `PUBLIC_ENDPOINT` + `PRIVATE_ENDPOINT` from aws in top of the `frontend/app.js` file.

  ```js
  /* frontend/app.js */
  // replace these values in app.js
  const AUTH0_CLIENT_ID = 'your-auth0-client-id-here';
  const AUTH0_DOMAIN = 'your-auth0-domain-here.auth0.com';
  const PUBLIC_ENDPOINT = 'https://your-aws-endpoint-here.amazonaws.com/dev/api/public';
  const PRIVATE_ENDPOINT = 'https://your-aws-endpoint-here.us-east-1.amazonaws.com/dev/api/private';
  ```

7. You can either run your frontend locally or deploy your frontend to host of your choosing. However in either case, make sure to configure the `Allowed Callback URL` and `Allowed Origins` in your auth0 client in the [auth0 dashboard](https://manage.auth0.com). An example of how to run your frontend locally:

  ```
  cd frontend;
  python -m http.server
  ```


## Custom authorizer functions

[Custom authorizers functions](https://aws.amazon.com/blogs/compute/introducing-custom-authorizers-in-amazon-api-gateway/) are executed before a Lambda function is executed and return an Error or a Policy document.

The Custom authorizer function is passing an `event` object to API Gateway as below:
```javascript
{
  "type": "TOKEN",
  "authorizationToken": "<Incoming bearer token>",
  "methodArn": "arn:aws:execute-api:<Region id>:<Account id>:<API id>/<Stage>/<Method>/<Resource path>"
}
```
You will have to change this policy to accommodate your needs. The default reply provided, will only authorize one endpoint!

## Frontend

The frontend is a bare bones vanilla javascript implementation.

You can replace it with whatever frontend framework you like =)

If you do implement in another framework, please consider adding it our [growing list of examples](https://github.com/serverless/examples/)!

API calls are made with the browser's native `fetch` api.
