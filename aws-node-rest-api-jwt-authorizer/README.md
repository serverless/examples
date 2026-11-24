<!--
title: 'REST API with a JWT authorizer and Amazon Cognito (NodeJS)'
description: 'Protect API Gateway REST API endpoints with a JWT authorizer that trusts an Amazon Cognito user pool, require an OAuth scope on one of them, and read the caller''s claims in Node.js.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# REST API with a JWT authorizer

[![Verified](https://raw.githubusercontent.com/serverless/examples/verified/badges/aws-node-rest-api-jwt-authorizer.svg)](https://github.com/serverless/examples/blob/verified/results.json)

A [JWT authorizer](https://www.serverless.com/framework/docs/providers/aws/events/apigateway#jwt-authorizers) makes API Gateway validate a JSON Web Token from an OpenID Connect or OAuth 2.0 identity provider before it calls your function: the token's signature, issuer, audience, expiry and the OAuth scopes an endpoint requires. No authorizer function runs, and a rejected request reaches none of your code. This example protects the endpoints of a REST API with a JWT authorizer that trusts an [Amazon Cognito user pool](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html) in the same service, requires an OAuth scope on one endpoint, and returns the caller's identity from the token's claims.

## What it deploys

- An API Gateway REST API with three endpoints: `GET /hello` for anyone, `GET /me` for callers with an ID token, and `GET /account` for callers with an access token that carries the scope `aws.cognito.signin.user.admin`.
- A JWT authorizer on the REST API, `users`, that trusts the user pool's tokens.
- An Amazon Cognito user pool and an app client, whose ID is the tokens' audience.
- Three Lambda functions, `hello`, `me` and `account`, with an IAM role and a CloudWatch Logs log group each.

## Prerequisites

- The Serverless Framework CLI, in a release that supports JWT authorizers for REST APIs: `npm i -g serverless`, which needs [Node.js](https://nodejs.org/). See [Getting started](https://www.serverless.com/framework/docs/getting-started).
- An AWS account, with credentials configured on your machine. See [AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials).
- A Serverless account, or a license key in `SERVERLESS_LICENSE_KEY`. The CLI asks you to sign in the first time you run it.
- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html), `curl` and `openssl`, to create a user and call the API. The commands in Try it are written for Bash.

## Deploy

Deploy from this directory:

```bash
serverless deploy
```

Without options, the deploy uses the stage `dev` and the Region `us-east-1`. To change them, pass `--stage` or `--region`, and pass the same options to every later command, including `serverless remove`.

You should see output like this:

```text
Deploying "rest-jwt-authorizer" to stage "dev" (us-east-1)
✔ Service deployed to stack rest-jwt-authorizer-dev (46s)
endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/hello
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/me
  GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/account

functions:
  hello: rest-jwt-authorizer-dev-hello (8.8 kB)
  me: rest-jwt-authorizer-dev-me (8.8 kB)
  account: rest-jwt-authorizer-dev-account (8.8 kB)
```

## Try it

Print the stack's outputs:

```bash
serverless info --verbose
```

The lines you need are these three:

```text
Stack Outputs:
  UserPoolClientId: xxxxxxxxxxxxxxxxxxxxxxxxxx
  UserPoolId: us-east-1_xxxxxxxxx
  ServiceEndpoint: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

Copy their values into shell variables. The user pool ID starts with its Region, which the AWS CLI commands below read from it:

```bash
API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
USER_POOL_ID=us-east-1_xxxxxxxxx
CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
REGION=${USER_POOL_ID%%_*}
```

Call the public endpoint. Each `curl` command prints the response body, then the status code:

```bash
curl -s -w '\n%{http_code}\n' "$API_URL/hello"
```

```text
{"message":"Hello from a public endpoint. No token needed."}
200
```

Call `/me` without a token. API Gateway answers `401` itself and doesn't call the function:

```bash
curl -s -w '\n%{http_code}\n' "$API_URL/me"
```

```text
{"message":"Unauthorized"}
401
```

Create a user in the pool with a random password, and sign in as that user to get its tokens. `admin-initiate-auth` returns an ID token and an access token, which the last command stores in `ID_TOKEN` and `ACCESS_TOKEN`:

```bash
PASSWORD="Aa1-$(openssl rand -hex 16)"
aws cognito-idp admin-create-user --region "$REGION" --user-pool-id "$USER_POOL_ID" --username demo-user --message-action SUPPRESS --query User.UserStatus --output text
aws cognito-idp admin-set-user-password --region "$REGION" --user-pool-id "$USER_POOL_ID" --username demo-user --password "$PASSWORD" --permanent
read -r ID_TOKEN ACCESS_TOKEN < <(aws cognito-idp admin-initiate-auth --region "$REGION" --user-pool-id "$USER_POOL_ID" --client-id "$CLIENT_ID" --auth-flow ADMIN_USER_PASSWORD_AUTH --auth-parameters "USERNAME=demo-user,PASSWORD=$PASSWORD" --query 'AuthenticationResult.[IdToken,AccessToken]' --output text)
```

`admin-create-user` prints the new user's status, `FORCE_CHANGE_PASSWORD`, and `admin-set-user-password` makes the password permanent, so the user can sign in.

Call `/me` with the ID token. API Gateway validates it and calls the function, which returns who the caller is. `claimsFrom` says where the function found the token's claims: `requestContext.authorizer.claims` in Regions where API Gateway passes them to the function, and `Authorization header` elsewhere (see [How it works](#how-it-works)):

```bash
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $ID_TOKEN" "$API_URL/me"
```

```text
{"message":"Hello from an endpoint that takes an ID token.","caller":{"sub":"9488f4f8-8011-702b-f606-77995523d4ab","username":"demo-user","tokenUse":"id","claimsFrom":"Authorization header"}}
200
```

Call `/account` with the ID token. The endpoint requires a scope, so API Gateway accepts only access tokens there and answers `401`:

```bash
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $ID_TOKEN" "$API_URL/account"
```

```text
{"message":"Unauthorized"}
401
```

Call `/account` with the access token, which carries the scope. The same user calls it, so `sub` is the same:

```bash
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $ACCESS_TOKEN" "$API_URL/account"
```

```text
{"message":"Hello from an endpoint that takes an access token with a scope.","caller":{"sub":"9488f4f8-8011-702b-f606-77995523d4ab","username":"demo-user","tokenUse":"access","scope":"aws.cognito.signin.user.admin","claimsFrom":"Authorization header"}}
200
```

To see why API Gateway rejected a token, read the `WWW-Authenticate` header of its response:

```bash
curl -s -o /dev/null -D - -H "Authorization: Bearer $ID_TOKEN" "$API_URL/account" | grep -i www-authenticate
```

```text
www-authenticate: Bearer error="invalid_token" error_description="the token's token_use is not valid for this method"
```

## How it works

The authorizer is defined once under `provider.apiGateway.authorizers` in [`serverless.yml`](https://github.com/serverless/examples/blob/v4/aws-node-rest-api-jwt-authorizer/serverless.yml), with the user pool as its issuer and the app client as its audience:

```yaml
provider:
  apiGateway:
    authorizers:
      users:
        type: jwt
        issuerUrl: !GetAtt UserPool.ProviderURL
        audience: !Ref UserPoolClient
        algorithms:
          - rs256
```

`issuerUrl` must equal the tokens' `iss` claim. For a Cognito user pool that is `https://cognito-idp.<region>.amazonaws.com/<user pool ID>`, which is the pool's `ProviderURL` attribute. `audience` is the app client ID, which ID tokens carry in `aud` and access tokens in `client_id`. `algorithms` lists the algorithms the issuer signs with; Cognito uses RS256. The pool and the app client are declared under `resources`, since the Framework doesn't create user pools.

Each `http` event references the authorizer by its key, and can list the OAuth scopes its endpoint requires:

```yaml
functions:
  me:
    handler: handler.me
    events:
      - http:
          path: me
          method: get
          authorizer: users
  account:
    handler: handler.account
    events:
      - http:
          path: account
          method: get
          authorizer:
            name: users
            scopes:
              - aws.cognito.signin.user.admin
```

With a Cognito issuer, an endpoint without `scopes` accepts only ID tokens, and an endpoint with `scopes` accepts only access tokens; a token of the other type gets `401`. A valid token that carries none of an endpoint's scopes gets `403` with `{"Message":"Access Denied"}`. The access tokens of this pool always carry `aws.cognito.signin.user.admin`, so this example shows the `401` cases; with your own resource server and scopes, an access token without the endpoint's scope gets the `403`.

[`handler.mjs`](https://github.com/serverless/examples/blob/v4/aws-node-rest-api-jwt-authorizer/handler.mjs) reads the validated token's claims from `event.requestContext.authorizer.claims`:

```javascript
const fromAuthorizer = event.requestContext?.authorizer?.claims;
const claims = fromAuthorizer ?? claimsOfToken(event.headers);
```

API Gateway's delivery of JWT claims to the integration is rolling out across AWS Regions. Where it hasn't arrived, `event.requestContext.authorizer` is `null`, and the function decodes the claims from the token in the `Authorization` header instead, without checking it again: API Gateway validated it before calling the function. `claimsFrom` in the response says which of the two the function used. See [Read JWT claims in the function](https://www.serverless.com/framework/docs/providers/aws/events/apigateway#read-jwt-claims-in-the-function).

## Cost and cleanup

While the example is deployed, API Gateway bills each request it receives, including the ones its authorizer rejects; Lambda bills each invocation and the functions' compute time; and Amazon Cognito bills the user pool's monthly active users on its Lite tier. Until you remove the stack, the functions' logs stay in CloudWatch Logs, which bills for stored log data. See [API Gateway pricing](https://aws.amazon.com/api-gateway/pricing/), [Lambda pricing](https://aws.amazon.com/lambda/pricing/), [Amazon Cognito pricing](https://aws.amazon.com/cognito/pricing/) and [CloudWatch pricing](https://aws.amazon.com/cloudwatch/pricing/). Remove the stack, with the API, the functions, the log groups, the user pool and its users, when you are done:

```bash
serverless remove
```

## Next steps

- Read [JWT authorizers](https://www.serverless.com/framework/docs/providers/aws/events/apigateway#jwt-authorizers) for issuers such as Auth0, Okta and Microsoft Entra ID, several issuers on one authorizer, and claim rules.
- Accept tokens from every app client of a pool with a [Cognito user pool authorizer](https://www.serverless.com/framework/docs/providers/aws/events/apigateway#cognito-user-pool-authorizers) instead.
- Start from a REST API without authorization in the [AWS Node.js REST API example](https://github.com/serverless/examples/tree/v4/aws-node-rest-api).
