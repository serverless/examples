<!--
title: TODO
description: This example demonstrates how to setup a serverless Telegram Bot on Azure.
layout: Doc
framework: v1
platform: Azure
language: nodeJS
authorLink: 'https://github.com/jiyeonseo'
authorName: seojeee
authorAvatar: 'https://avatars2.githubusercontent.com/u/2231510?v=4&s=140'
-->
# Azure Node Telegram Bot
This example of telegram bot using Azure Function with Serverless Framework. 

## Usage

### Required 
- Node.js `v6.5.0` or later
- Telegram account 📱 
- Azure Account. check this [link](https://serverless.com/framework/docs/providers/azure/guide/credentials/) about azure credentials.   

### Get started
1. Clone the repo and install dependencies
```shall
# Clone the repo
$ git clone git@github.com:serverless/examples.git serverless-examples
$ cd serverless-examples/azure-node-telegram-bot

# Install the Serverless Framework
$ npm install serverless -g

# Install the necessary plugins
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
