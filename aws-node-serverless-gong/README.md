<!--
title: 'The Serverless Gong'
description: 'A serverless gong with GitHub and Slack webhooks'
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/bildungsroman'
authorName: 'Anna Spysz'
authorAvatar: 'https://avatars3.githubusercontent.com/u/5382821?v=4&s=140'
-->

# The Serverless Gong! 🔔

A serverless gong with GitHub and Slack webhooks - made for the [No Server November Challenge](https://serverless.com/blog/no-server-november-challenge/).

When a selected repository in GitHub has a release event, a chosen Slack channel is messaged with a gong! Your final result will look like this:

![screenshot](https://www.stackery.io/blog/assets/images/posts/serverless-gong/gong6.png)

## Instructions

* Read the [Serverless Webhooks Tutorial](https://docs.stackery.io/docs/tutorials/serverless-webhooks/) to get started
* Read the [blog post on the Serverless Gong](https://www.stackery.io/blog/serverless-gong/) for more on this project and detailed instructions with screenshots

## Setup

#### Deploy this to your AWS account using Serverless Framework

If you have the Serverless CLI set up, you can simply enter `serverless deploy` to deploy!

#### Deploy this to your AWS account using Stackery

You can create and deploy this application to your own AWS account using the following two Stackery CLI commands:

`stackery create` will initialize a new repo in your GitHub account, initializing it with the contents of the referenced template repository.

```
stackery create --stack-name 'serverless-gong' \
--git-provider 'github' \
--template-git-url 'https://github.com/stackery/serverless-gong' 
```

`stackery deploy` will deploy the newly created stack into your AWS account.

```
stackery deploy --stack-name 'serverless-gong' \
--env-name 'development' \
--git-ref 'master'
```
