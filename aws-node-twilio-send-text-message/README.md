<!--
title: AWS Send SMS Message with Twilio example in NodeJS
description: This example demonstrates how to send SMS messages with the Twilio SDK and AWS lambda.
layout: Doc
-->
# Send SMS Message with Twilio

<img align="right" width="316" height="103" src="https://s3-us-west-2.amazonaws.com/assets.site.serverless.com/blog/twilio-logo.jpg">
This example demonstrates how to send SMS messages with the Twilio SDK and AWS lambda.

[Live the live demo](http://twilio-serverless-example.surge.sh)

## Use Cases:

* Sending users confirmation text messages

## Setup

1. Sign up for a [Twilio account](http://www.twilio.com)

2. Create a [new phone number](https://www.twilio.com/console/phone-numbers/) in your Twilio trial account

3. Grab your ACCOUNT SID and AUTH TOKEN from the [Twilio console](https://www.twilio.com/console) and plug those into the `serverless.yml` file in the next step

4. Set your `env` variables in `serverless.yml` with your Twilio account values

  ```yml
  environment:
    # replace these env variables with your twilio account values
    TWILIO_ACCOUNT_SID: YOUR-TWILIO-ACCOUNT-SID-HERE
    TWILIO_AUTH_TOKEN: YOUR-TWILIO-AUTH-TOKEN-HERE
    TWILIO_PHONE_NUMBER: YOUR-TWILIO-PHONE-NUMBER-HERE
  ```

  If you want to use encrypted API keys, see our [encrypted environment variables example](https://github.com/serverless/examples/tree/master/aws-node-env-variables-encrypted-in-a-file)

5. Invoke the function and send an SMS message

  Update the `to` phone number the `event.json` file and `message` to send in the SMS

  Then invoke the function with the serverless CLI. Set the `--path event.json` so the function knows where to send the SMS.

  ```bash
  serverless invoke -f sendText --path event.json
  ```

6. (Optional) Deploy the front-end application

  Update the `API_ENDPOINT` variable in the `/frontend/index.html` file and deploy the `/frontend` folder to a static host of your choice.

  We recommend S3, [netlify](https://www.netlify.com/), or [surge.sh](http://surge.sh/) for quick and easy static site hosting.
