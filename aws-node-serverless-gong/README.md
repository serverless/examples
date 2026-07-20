<!--
title: 'The Serverless Gong'
description: 'A serverless gong with GitHub and Slack webhooks'
framework: v4
platform: AWS
language: nodeJS
priority: 10
authorLink: 'https://github.com/bildungsroman'
authorName: 'Anna Spysz'
authorAvatar: 'https://avatars3.githubusercontent.com/u/5382821?v=4&s=140'
-->

# The Serverless Gong! 🔔

A serverless gong with GitHub and Slack webhooks - made for the [No Server November Challenge](https://serverless.com/blog/no-server-november-challenge/).

When a selected repository in GitHub has a release event, a chosen Slack channel is messaged with a gong! Your final result will look like this:

![screenshot](https://www.stackery.io/blog/assets/images/posts/serverless-gong/gong6.png)

## Setup

1. Create a [Slack incoming webhook](https://api.slack.com/messaging/webhooks) for the channel you want to gong.

2. Set your GitHub webhook secret and Slack webhook URL in `serverless.yml` by replacing `REPLACE-WITH-YOUR-SECRET-HERE` and `REPLACE-WITH-YOUR-SLACK-WEBHOOK-URL-HERE`.

    ```yml
    provider:
      environment:
        GITHUB_WEBHOOK_SECRET: REPLACE-WITH-YOUR-SECRET-HERE
        SLACK_WEBHOOK_URL: REPLACE-WITH-YOUR-SLACK-WEBHOOK-URL-HERE
    ```

3. Deploy the service

    ```bash
    serverless deploy
    ```

4. Configure a webhook on the GitHub repository you want to gong. [Setting up a Webhook](https://developer.github.com/webhooks/creating/#setting-up-a-webhook). Point it at the deployed `/webhook` endpoint and select at least the `Releases` event.

5. Cut a release on the repository and watch the gong land in Slack! 🔔
