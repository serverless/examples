<!--
title: 'Simple Telegram bot'
description: 'This is a simple echo bot on Telegram.'
framework: v1
platform: AWS
language: NodeJS
authorLink: 'https://github.com/hrchu'
authorName: 'Peter Chu'
authorAvatar: 'https://avatars2.githubusercontent.com/u/3183314?s=460&v=4'
-->

# AWS-telegram-echo-bot

This is a simple echo bot on Telegram. (NodeJS)

### Required 
- Node.js `v6.5.0` or later
- Telegram account 
- AWS account

## Get Started

1.  Install serverless via npm

```
$ npm install -g serverless
$ npm install
```

2. Create a bot from Telegram, sending this message to [@BotFather](https://web.telegram.org/#/im?p=@BotFather)
```
$ /newbot
```


3. Put the token received into a file called `handle.js`.
```
const token = "YOUR_API_TOKEN";
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

