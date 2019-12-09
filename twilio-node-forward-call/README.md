<!--
title: 'Twilio Forward a Call'
description: 'This example projects helps you deploy a serverless function to the Twilio runtime. The function responds the TwiML configuration to forward phone call.'
framework: v1
platform: Twilio
language: nodeJS
authorLink: 'https://github.com/stefanjudis'
authorName: 'Stefan Judis'
authorAvatar: 'https://avatars3.githubusercontent.com/u/962099?v=4&s=140'
-->

# Serverless Boilerplate - Twilio - Node.js - Forward a call

[Twilio](https://www.twilio.com) is a commincations API provide that allows developers to build applications using phone calls, SMS, emails and more. To configure communications a lot of services work with a configuration language called [TwiML](https://www.twilio.com/docs/glossary/what-is-twilio-markup-language-twiml).

This example projects helps you deploy a serverless function to the Twilio runtime. The function responds the TwiML configuration to [forward phone call](https://www.twilio.com/docs/voice/tutorials/call-forwarding).

Make sure `serverless` is installed globally. [See installation guide](https://serverless.com/framework/docs/providers/openwhisk/guide/installation/).

You will also need to set up your Twilio account credentials using environment variables. You find these in your [Twilio Console](https://twilio.com/console/).

Needed environment variables are:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `MY_PHONE_NUMBER`

## 1. Install Twilio Node.js Provider Plugin & Service Dependencies
`npm install` in this directory to download the modules from `package.json`.

## 2. Deploy
`serverless deploy` or `sls deploy`. `sls` is shorthand for the Serverless CLI command

## 3. Invoke deployed function
`serverless invoke --function forward-call` or `serverless invoke -f forward-call`

`-f` is shorthand for `--function`

In your terminal window you should see the response from Apache OpenWhisk

```xml
<?xml version="1.0" encoding="UTF-8"?><Response><Dial>+491...</Dial></Response>
```

Congrats you have just deployed and run your Forward Call function!

**For more information on the Twilio Runtime Serverless plugin, please see the project repository: [github.com/twilio-labs/serverless-framework-integration](https://github.com/twilio-labs/serverless-framework-integration).**
