<!--
title: 'Ruby LINE bot'
description: 'This example shows you how to create a LINE bot using Ruby.'
framework: v4
platform: AWS
language: Ruby
priority: 10
authorLink: 'https://github.com/knugie'
authorName: 'Wolfgang Teuber'
authorAvatar: 'https://avatars0.githubusercontent.com/u/1446195?v=4&s=140'
-->

# AWS-ruby-line-echo-bot

Follow this [project](https://github.com/serverless/examples/tree/v4/aws-python-line-echo-bot),

I use my first language(ruby) to build this on serverless,

so you can use this project in others case.

# Before you start

1. LINE developer account
2. [LINE Messaging API](https://developers.line.biz/en/docs/messaging-api/getting-started/)

# Get Started

1. Install serverless via npm

```bash=
$ npm install -g serverless
```

2. Setup your **AWS** ceritficate

```bash=
export AWS_ACCESS_KEY_ID=<your-key-here>
export AWS_SECRET_ACCESS_KEY=<your-secret-key-here>
```

3. Set your LINE bot channel secret & access token as environment variables before deploying

```bash=
export LINE_CHANNEL_SECRET=<your-channel-secret-here>
export LINE_CHANNEL_ACCESS_TOKEN=<your-channel-access-token-here>
```

4. Deploy the webhook function

```bash=
npm install
serverless deploy
```

5. Register the deployed `webhook` endpoint URL as your LINE bot's webhook URL in the [LINE Developers console](https://developers.line.biz/console/), then send it a message.

Now you can test your chatbot, have fun!
![Echo bot](https://i.imgur.com/ekiLRHS.png)

## Implementation notes

The handler uses `line-bot-api` v2's `Line::Bot::V2::WebhookParser` to validate the `X-Line-Signature`
header on every incoming request before processing it, and replies through
`Line::Bot::V2::MessagingApi::ApiClient`. See the [gem's README](https://github.com/line/line-bot-sdk-ruby)
for the full Messaging API surface.

# References

- [Plugin hook](https://github.com/serverless/serverless/issues/5567#issuecomment-444671106)
