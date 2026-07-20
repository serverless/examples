<!--
title: 'Simple Telegram bot'
description: 'This is a simple echo bot on Telegram.'
framework: v4
platform: AWS
language: NodeJS
priority: 10
authorLink: 'https://github.com/hrchu'
authorName: 'Peter Chu'
authorAvatar: 'https://avatars2.githubusercontent.com/u/3183314?s=460&v=4'
-->

# AWS-telegram-echo-bot

This is a simple echo bot on Telegram. (NodeJS)

### Required 
- Node.js `24.x` or later
- Telegram account 
- AWS account

## Get Started

1.  Install serverless via npm

```
$ npm install -g serverless
```

2. Create a bot from Telegram, sending this message to [@BotFather](https://web.telegram.org/#/im?p=@BotFather)
```
$ /newbot
```


3. Put the token received into the `TELEGRAM_BOT_TOKEN` environment variable in `serverless.yml`.
```yml
provider:
  environment:
    TELEGRAM_BOT_TOKEN: YOUR_API_TOKEN_HERE
```

4. Deploy it!
```
$ serverless deploy
```

5. Configure webhook
```
curl --request POST --url https://api.telegram.org/bot{token}/setWebhook --header 'content-type: application/json' --data '{"url": "{end-poinnt}"}'
```

Say `hello` to your bot 🤖

