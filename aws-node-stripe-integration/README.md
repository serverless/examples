<!--
title: 'AWS Stripe Integration example in NodeJS'
description: 'This example for Stripe integration using AWS Lambda and API Gateway.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/adambrgmn'
authorName: 'Adam Bergman'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13746650?v=4&s=140'
-->
# Stripe Integration Example

This example for Stripe integration using AWS Lambda and API Gateway.

## Use Cases

- Notified about events that happen in a Stripe account.

## Setup

### Install npm packages
```bash
$ npm install
```

### Set your Stripe secret keys

Edit the `environment` block in `serverless.yml` with your Stripe secret keys:

```yaml
provider:
  environment:
    STRIPE_TEST_SECRET_KEY: 'Stripe_Test_Secret_Key_here'
    STRIPE_LIVE_SECRET_KEY: 'Stripe_Live_Secret_Key_here'
```

### Deploy!
```bash
$ serverless deploy
```

or production
```bash:production
$ serverless deploy --stage live
```

```
Deploying "aws-node-stripe-integration" to stage "test" (us-east-1)

✔ Service deployed to stack aws-node-stripe-integration-test (42s)

endpoint: POST - https://xxxxxxxxx.execute-api.us-east-1.amazonaws.com/test/stripe/incoming
functions:
  incoming: aws-node-stripe-integration-test-incoming (1.2 kB)
```
