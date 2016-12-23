# Serverless Github webhook listener

This service will listen to github webhooks fired by a given repository.

## Use Cases

* Custom github notifications
* Automatically tagging github issues
* Pinging slack on new Pull requests
* Welcoming new stargazers
* etc.

<img width="316" alt="github-webhooks" src="https://cloud.githubusercontent.com/assets/532272/21461458/9d67f53e-c91f-11e6-9228-f57e47d9ed76.png">

## Setup

1. Set your webhook secret token in `serverless.yml` by replacing `YOUR-SECRET-HERE` in the environment variables `GITHUB_WEBHOOK_SECRET`.

  ```yml
  provider:
    name: aws
    runtime: nodejs4.3
    environment:
      GITHUB_WEBHOOK_SECRET: YOUR-SECRET-HERE
  ```

2. Deploy the service

  ```yaml
  serverless deploy
  ```

3. Take your API gateway endpoint, and put it into your repo's webhook settings in github. [Setting up a Webhook](https://developer.github.com/webhooks/creating/#setting-up-a-webhook)

4. Do something in your github repo to trigger a webhook and tail the logs of the lambda function

  ```bash
  serverless logs -f githubWebhookListener -t
  ```

You should see the event from github in the lambda functions logs.
