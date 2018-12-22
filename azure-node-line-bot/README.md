<!--
title: TODO
description: This example demonstrates how to setup a serverless Line Bot using Node.js.
layout: Doc
framework: v1
platform: Azure
language: nodeJS
authorLink: 'https://github.com/jiyeonseo'
authorName: seojeee
authorAvatar: 'https://avatars2.githubusercontent.com/u/2231510?v=4&s=140'
-->
# Azure-line-bot-exmaple

This is simple echo bot on Line messenger.  

## Before you begin
- Line developer account
- [A channel for Line Messaging API](https://developers.line.me/en/docs/messaging-api/getting-started/)

## Get started

### install dependencies

```
$ npm install 
```

### insert your Line bot Access Token & Secret 
```
const config = {
  channelAccessToken: "CHANNEL_ACCESS_TOKEN",
  channelSecret: "CHANNEL_SECRET",
};

```

### deploy
```
serverless deploy
```

![image](https://github.com/jiyeonseo/azure-line-bot-example/blob/master/screenshot-2.png)

## More details  
- [Building a bot](https://developers.line.me/en/docs/messaging-api/building-bot/)
- [line-bot-sdk-nodejs](https://github.com/line/line-bot-sdk-nodejs)