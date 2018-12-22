<!--
title: Joke Twitter Bot
description: Twitter bot that will periodically tweet out a joke obtained from a joke API.
layout: Doc
framework: v1
platform: AWS
language: nodeJS
authorLink: 'https://github.com/Fixy250185'
authorName: 'Craig Sweaton'
authorAvatar: 'https://avatars0.githubusercontent.com/u/26969518?v=4&s=140'
-->
# Joke Twitter Bot

## Description
This is a Twitter bot that will periodically tweet out a joke obtained from a joke API [https://icanhazdadjoke.com/](https://icanhazdadjoke.com/)

## Installation
Run `npm i` to install dependencies

## Setup
An environment file is required to contain the secret keys for the Twitter API and the joke API's URL. The naming convention for this file is `[STAGE].env.json`, for example `dev.env.json`.

This is the env file that should be placed in the project root.
```json
{
    "JOKES_API_URL":"https://icanhazdadjoke.com/",
    "TWITTER_CONSUMER_KEY": "YOUR KEY GOES HERE",
    "TWITTER_CONSUMER_SECRET": "YOUR KEY GOES HERE",
    "TWITTER_ACCESS_TOKEN_KEY": "YOUR KEY GOES HERE",
    "TWITTER_ACCESS_TOKEN_SECRET": "YOUR KEY GOES HERE"
}
```

## Testing
The bot can be invoked manually during development with the following command
```
sls invoke local -f bot
```

## Deployment
- Both the `STAGE` and `REGION` options can be used with this bot. If left out the bot will default to `dev` stage and `eu-west-1` region.

Deploy command
```
sls deploy --stage dev --region eu-west-1
```

## Notes
The API request in `helpers/jokes.js` sets a custom User-Agent header to identify users to the joke API owners. Please customise this to your library name.