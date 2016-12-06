# Custom Authorizers Auth0 + API Gateway Example

This is an example of how to protect API endpoints with [auth0](https://auth0.com/), JSON Web Tokens (jwt) and a [custom authorizer function](https://serverless.com/framework/docs/providers/aws/events/apigateway#http-endpoints-with-custom-authorizers)

Custom Authorizers allow you to run an AWS Lambda Function before your targeted AWS Lambda Function. This is useful for Microservice Architectures or when you simply want to do some Authorization before running your business logic.

### [View live demo](http://auth0-serverless-protected-routes-demo.surge.sh/)

## Use cases

- Protect API routes for authorized users
- Rate limiting APIs

## Setup

1. `npm install` json web token dependencies

2. Setup an [auth0 client](https://auth0.com/docs/clients) and get your `client id` and `client secrets` from auth0.

3. Plugin your `AUTH0_CLIENT_ID` and `AUTH0_CLIENT_SECRET` in `handler.js`. These will be used by the JSON web token decoder to validate private api access.

  ```js
  /* handler.js */
  // Replace with your auth0 client values
  const AUTH0_CLIENT_ID = 'your-auth0-client-id-here';
  const AUTH0_CLIENT_SECRET = 'your-auth0-client-secret-here';
  ```

4. Deploy the service with `serverless-deploy` and grab the public and private endpoints.

5. Plugin your `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, and the `PUBLIC_ENDPOINT` + `PRIVATE_ENDPOINT` from aws in top of the `frontend/app.js` file.

  ```js
  // replace these values in app.js
  const AUTH0_CLIENT_ID = 'your-auth0-client-id-here';
  const AUTH0_DOMAIN = 'your-auth0-domain-here.auth0.com';
  const PUBLIC_ENDPOINT = 'https://your-aws-endpoint-here.amazonaws.com/dev/api/public';
  const PRIVATE_ENDPOINT = 'https://your-aws-endpoint-here.us-east-1.amazonaws.com/dev/api/private';
  ```

6. Deploy Frontend to host of your choosing and make sure you configure the `Allowed Callback URL` and `Allowed Origins` in your auth0 client in the [auth0 dashboard](https://manage.auth0.com)

## Frontend

The frontend is a bare bones vanilla javascript implementation.

You can replace it with whatever frontend framework you like =)

If you do implement in another framework, please consider adding it our growing list of examples!

API calls are made with the browser's native `fetch` api.
