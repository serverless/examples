<!--
title: API Gateway Authorizer Function for Auth0 or AWS Cognito using RS256 JSON Web Key Sets tokens.
description: Authorize your API Gateway with either Auth0 or Cognito JWKS RS256 tokens.
layout: Doc
-->
# API Gateway Authorizer Function for Auth0 or AWS Cognito using the [JWKS](https://auth0.com/docs/jwks) method.

This is an example of how to protect API endpoints with [Auth0](https://auth0.com/) or [AWS Cognito](https://aws.amazon.com/cognito/) using JSON Web Key Sets ([JWKS](https://auth0.com/docs/jwks)) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).

Custom Authorizers allow you to run an AWS Lambda Function via API Gateway before your targeted AWS Lambda Function is run. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.


## Use cases

- Protect API routes for authorized users
- Rate limiting APIs
- Remotely revoke tokens

## Setup

1. `npm install` json web token dependencies

2. In [auth.js](auth.js#L10) replace the value of `iss` with either your [Auth0 iss](http://bit.ly/2hoeRXk) or [AWS Cognito ISS](http://amzn.to/2fo77UI). Make sure the `iss` url ends in a trailing `/`.

  ```js
  /* auth.js */
  // Replace with your auth0 or Cognito values
  const iss = "https://<url>.com/";
  ```

3. Deploy the service with `sls deploy` and grab the public and private endpoints.

## Test Authentication:  
-  Test with [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en): Make a new GET request with the Header containing "Authorization" with the value being "bearer `<id_token>`" for your `api/private` url.
- Test using curl:
  ```sh
  curl --header "Authorization: bearer <id_token>" https://{api}.execute-api.{region}.amazonaws.com/api/private
  ```
