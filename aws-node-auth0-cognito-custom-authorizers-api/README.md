<!--
title: API Gateway Authorizer Function for Auth0 or AWS Cognito using RS256 tokens.
description: Authorize your API Gateway with either Auth0 or Cognito JWKS RS256 tokens.
layout: Doc
-->
# API Gateway Authorizer Function for Auth0 or AWS Cognito using RS256 tokens.

This is an example of how to protect API endpoints with [Auth0](https://auth0.com/) or [AWS Cognito](https://aws.amazon.com/cognito/) using JSON Web Key Sets ([JWKS](https://auth0.com/docs/jwks)) and a [custom authorizer lambda function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers).

Custom Authorizers allow you to run an AWS Lambda Function via API Gateway before your targeted AWS Lambda Function is run. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.


## Use cases

- Protect API routes for authorized users
- Rate limiting APIs

## Setup

1. `npm install` json web token dependencies

2. In [auth.js](auth.js#L10) replace the value of `iss` with either your [Auth0 iss](http://bit.ly/2hoeRXk) or [AWS Cognito ISS](http://amzn.to/2fo77UI).

3. In [auth.js](auth.js#L17) replace the value of the `jwks` variable with the value of the entire JSON file which can be found either on [Auth0](http://bit.ly/2wedaP0) or [AWS Cognito](http://amzn.to/2fiE55n).


  ```js
  /* auth.js */
  // Replace with your auth0 or Cognito values
  const iss = "https://<url>.com/";
  const jwks = "<Paste JSON from jwks.json here>";
  ```

Deploy the service with `sls deploy` and grab the public and private endpoints.

## Test Authentication:  
-  Use [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) and make a new GET request with the Header containing "Authorization" with the value being "bearer `<id_token>`" for your `api/private` url.
- Run the following curl command:
  ```sh
  curl --header "Authorization: bearer <id_token>" https://{api}.execute-api.{region}.amazonaws.com/api/private
  ```
