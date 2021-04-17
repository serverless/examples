<!--
title: 'AWS Serverless EventBridge examples in NodeJS'
description: 'This example demonstrates how to add events to an EventBridge bus and then trigger rules.'
layout: Doc
framework: v2
platform: AWS
language: nodeJS
authorLink: 'https://github.com/WayneGreeley'
authorName: 'Wayne Greeley'
authorAvatar: 'https://avatars.githubusercontent.com/u/28657024?s=60&v=4'
-->
# Serverless EventBridge example

This example demonstrates how to add events to the default bus and a custom bus and how to trigger event rules.

## Use-case

De-coupling microservices using the AWS EventBridge service

## Setup

```bash
npm i -g serverless
npm i
sls deploy
```

### Send a message to Alice Lambda

```bash
curl -X POST -H "Content-Type:application/json" https://XXXXXXX.execute-api.us-east-1.amazonaws.com/alice 
--data '{ "messageSentToAlice": "Learn Serverless" }'
```

Example Result:
```bash
{"message":"Alice was called"}
```

Alice leaves an event on a custom bus.
Bob is listening for events that Alice creates.

Dave is a schedule cron Lambda that runs every 10 minutes.
Dave picks a random number between 1 and 151 and fetches the Pokemon from PokeAPI for that random number.

Eve has lots of rules she is listening for on the default EventBridge bus including scheduled events like Dave.

This example if a combination of lessons learned from Phillip Muns blog:
https://www.serverless.com/blog/eventbridge-use-cases-and-tutorial/

and Marcia Villalba YouTube video:
https://www.youtube.com/watch?v=VYtBXdf53b4

