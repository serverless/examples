<!--
title: Serverless Github Check
description: The idea is to validate that all Pull Requests are related to a specific trello card.
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/Fortiz2305'
authorName: 'Francisco Ortiz'
authorAvatar: 'https://avatars0.githubusercontent.com/u/4025821?v=4&s=140'
-->
# Serverless Github Check
Serverless Github Check. This repo is part of the [Serverless November Challenge](https://serverless.com/blog/no-server-november-challenge/)

### Use Case

The idea is to validate that all Pull Requests are related to a specific trello card.

Check rules:

* To pass the check, the Pull Request body should start with: "Related trello card: https://trello.com/"

### Setup

* Set your github token in [AWS Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html). The project is already configured to take the token from there if you call it `githubToken`. More info about adding parameters to AWS Parameter Store and why it's good to use it [here](https://serverless.com/blog/serverless-secrets-api-keys/)

* Deploy the service

```
serverless deploy
```

After the deploy has finished, you should see something like:

```
Service Information
service: serverless-github-check
stage: dev
region: eu-west-1
stack: serverless-github-check-dev
api keys:
  None
endpoints:
  POST - https://abcdefghij.execute-api.eu-west-1.amazonaws.com/dev/webhook
functions:
  githubCheck: serverless-github-check-dev-githubCheck
```

* Configure the webhook in the github repository settings. This [link](https://developer.github.com/webhooks/creating/#setting-up-a-webhook) can help you.

  * In the Payload URL, set the API POST endpoint of your function.
  * In the types of events to trigger the webhook, select "Let me select individual events". Once there, select at least `Pull Requests`.

* Apply the github check for Trello cards or change the rule to apply a new one! :)
