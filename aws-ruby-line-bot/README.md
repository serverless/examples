<!--
title: 'Ruby LINE bot'
description: 'This example shows you how to create a LINE bot using Ruby.'
framework: v1
platform: AWS
language: Ruby
authorLink: 'https://github.com/knugie'
authorName: 'Wolfgang Teuber'
authorAvatar: 'https://avatars0.githubusercontent.com/u/1446195?v=4&s=140'
-->

# AWS-ruby-line-echo-bot

Follow this [project](https://github.com/serverless/examples/tree/master/aws-python-line-echo-bot),

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

3. Insert you line bot secret & key

```python=
config.channel_secret = "YOUR_LINE_CHANNEL_SECRET"
config.channel_token = "YOUR_LINE_CHANNEL_TOKEN"
```

4. Deploy the webhook function

```bash=
npm install
serverless deploy
```

Now you can test your chatbot, have fun!
![Echo bot](https://i.imgur.com/ekiLRHS.png)

# References

- [Plugin hook](https://github.com/serverless/serverless/issues/5567#issuecomment-444671106)
