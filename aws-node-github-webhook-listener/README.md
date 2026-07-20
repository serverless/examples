<!--
title: 'AWS Serverless Github Webhook Listener example in NodeJS'
description: 'This service will listen to github webhooks fired by a given repository.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/adambrgmn'
authorName: 'Adam Bergman'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13746650?v=4&s=140'
-->
# Serverless Github webhook listener

This service will listen to github webhooks fired by a given repository.

## Use Cases

* Custom github notifications
* Automatically tagging github issues
* Pinging slack on new Pull requests
* Welcoming new stargazers
* etc.

## How it works

```
┌───────────────┐               ┌───────────┐
│               │               │           │
│  Github repo  │               │   Github  │
│   activity    │────Trigger───▶│  Webhook  │
│               │               │           │
└───────────────┘               └───────────┘
                                      │
                     ┌────POST────────┘
                     │
          ┌──────────▼─────────┐
          │ ┌────────────────┐ │
          │ │  API Gateway   │ │
          │ │    Endpoint    │ │
          │ └────────────────┘ │
          └─────────┬──────────┘
                    │
                    │
         ┌──────────▼──────────┐
         │ ┌────────────────┐  │
         │ │                │  │
         │ │     Lambda     │  │
         │ │    Function    │  │
         │ │                │  │
         │ └────────────────┘  │
         └─────────────────────┘
                    │
                    │
                    ▼
         ┌────────────────────┐
         │                    │
         │      Do stuff      │
         │                    │
         └────────────────────┘
```

## Setup

1. Set your webhook secret token in `serverless.yml` by replacing `REPLACE-WITH-YOUR-SECRET-HERE` in the environment variables `GITHUB_WEBHOOK_SECRET`.

  ```yml
  provider:
    name: aws
    runtime: nodejs24.x
    environment:
      GITHUB_WEBHOOK_SECRET: REPLACE-WITH-YOUR-SECRET-HERE
  ```

2. Deploy the service

  ```yaml
  serverless deploy
  ```

  After the deploy has finished you should see something like:
  ```
  Deploying "github-webhook-listener" to stage "dev" (us-east-1)

  ✔ Service deployed to stack github-webhook-listener-dev (36s)

  endpoint: POST - https://abcdefg.execute-api.us-east-1.amazonaws.com/dev/webhook
  functions:
    githubWebhookListener: github-webhook-listener-dev-githubWebhookListener (1.2 kB)
  ```

3. Configure your webhook in your github repository settings. [Setting up a Webhook](https://developer.github.com/webhooks/creating/#setting-up-a-webhook)

  **(1.)** Plugin your API POST endpoint. (`https://abcdefg.execute-api.us-east-1.amazonaws.com/dev/webhook` in this example). Run `sls info` to grab your endpoint if you don't have it handy.

  **(2.)** Plugin your secret from `GITHUB_WEBHOOK_SECRET` environment variable

  **(3.)** Choose the types of events you want the github webhook to fire on

  ![webhook-steps](https://cloud.githubusercontent.com/assets/532272/21461773/db7cecd2-c911e6-936bbf4661fe14.jpg)


4. Manually trigger/test the webhook from settings or do something in your github repo to trigger a webhook.

  You can tail the logs of the lambda function with the below command to see it running.
  ```bash
  serverless logs -f githubWebhookListener -t
  ```

  You should see the event from github in the lambda functions logs.

5. Use your imagination and do whatever you want with your new github webhook listener! 🎉

Let us know if you come up with a cool use case for this service =)
