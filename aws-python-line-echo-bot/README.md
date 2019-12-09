<!--
title: 'Simple LINE bot'
description: 'This is a simple echo bot on LINE bot.'
framework: v1
platform: AWS
language: Python
authorLink: 'https://github.com/NiJia'
authorName: 'NiJia'
authorAvatar: 'https://avatars0.githubusercontent.com/u/418548?v=4&s=140'
-->

# AWS-python-line-echo-bot

This is a simple echo bot on LINE bot. (python)

## Before you start

1. LINE developer account
2. [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/getting-started/)

## Get Started

1.  Install serverless via npm

```bash=
$ npm install -g serverless
```

2. Setup your AWS ceritficate

```bash=
$ export AWS_ACCESS_KEY_ID=<your-key-here>
$ export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

3. Setup you line bot secret & key

```python=
line_bot_api = LineBotApi('YOUR_CHANNEL_ACCESS_TOKEN')
handler = WebhookHandler('YOUR_CHANNEL_SECRET')
```

4. Deploy the webhook function

```bash=
$ npm install
$ serverless deploy
```

![Echo bot](https://i.imgur.com/Tn1XS13.png)
